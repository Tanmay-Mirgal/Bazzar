package com.bazzar.controller;

import com.bazzar.config.ClerkUserResolver;
import com.bazzar.dto.response.OrderResponse;
import com.bazzar.entity.Order;
import com.bazzar.entity.OrderStatus;
import com.bazzar.entity.User;
import com.bazzar.exception.BadRequestException;
import com.bazzar.exception.ResourceNotFoundException;
import com.bazzar.repository.OrderRepository;
import com.bazzar.service.OrderService;
import com.bazzar.service.RazorpayService;
import com.bazzar.service.ShiprocketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/razorpay")
public class PaymentController {

    private final RazorpayService razorpayService;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final ShiprocketService shiprocketService;
    private final EmailService emailService;
    private final ClerkUserResolver clerkUserResolver;

    public PaymentController(RazorpayService razorpayService,
                             OrderRepository orderRepository,
                             OrderService orderService,
                             ShiprocketService shiprocketService,
                             EmailService emailService,
                             ClerkUserResolver clerkUserResolver) {
        this.razorpayService = razorpayService;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.shiprocketService = shiprocketService;
        this.emailService = emailService;
        this.clerkUserResolver = clerkUserResolver;
    }

    /**
     * Creates a Razorpay Order for frontend checkout modal.
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createRazorpayOrder(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> body) {
        User user = clerkUserResolver.resolveOrThrow(jwt);

        Long orderId = null;
        if (body.containsKey("orderId") && body.get("orderId") != null) {
            orderId = Long.valueOf(body.get("orderId").toString());
        }

        BigDecimal amount = BigDecimal.ZERO;
        if (body.containsKey("amount") && body.get("amount") != null) {
            amount = new BigDecimal(body.get("amount").toString());
        }

        Map<String, Object> razorpayOrder = razorpayService.createOrder(orderId, amount);
        return ResponseEntity.ok(razorpayOrder);
    }

    /**
     * Verifies payment signature and marks order as PAID + creates Shiprocket shipment.
     */
    @PostMapping("/verify")
    @Transactional
    public ResponseEntity<OrderResponse> verifyPayment(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body) {
        User user = clerkUserResolver.resolveOrThrow(jwt);

        String orderIdStr = body.get("orderId");
        String razorpayOrderId = body.get("razorpayOrderId");
        String razorpayPaymentId = body.get("razorpayPaymentId");
        String razorpaySignature = body.get("razorpaySignature");

        if (orderIdStr == null || razorpayOrderId == null || razorpayPaymentId == null) {
            throw new BadRequestException("Missing required payment verification parameters");
        }

        Long orderId = Long.valueOf(orderIdStr);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        boolean isValid = razorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValid) {
            order.setPaymentStatus("FAILED");
            orderRepository.save(order);
            throw new BadRequestException("Razorpay payment signature verification failed");
        }

        order.setPaymentStatus("PAID");
        order.setPaymentMethod("RAZORPAY");
        order.setPaymentId(razorpayPaymentId);
        order.setRazorpayOrderId(razorpayOrderId);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setTrackingStatus("MANIFESTED");

        // Automatically dispatch to Shiprocket
        try {
            Map<String, String> shipmentInfo = shiprocketService.createShipment(order);
            order.setShipmentId(shipmentInfo.get("shipmentId"));
            order.setAwbCode(shipmentInfo.get("awbCode"));
            order.setCourierName(shipmentInfo.get("courierName"));
        } catch (Exception e) {
            // Non-blocking for smooth user experience
        }

        Order saved = orderRepository.save(order);

        // Send confirmation email with tracking link to user
        try {
            emailService.sendOrderPlacedEmail(saved);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(orderService.toResponse(saved));
    }
}
