package com.bazzar.service;

import com.bazzar.dto.request.OrderRequest;
import com.bazzar.dto.response.OrderItemResponse;
import com.bazzar.dto.response.OrderResponse;
import com.bazzar.dto.response.OrderTrackingResponse;
import com.bazzar.entity.*;
import com.bazzar.exception.BadRequestException;
import com.bazzar.exception.ResourceNotFoundException;
import com.bazzar.repository.CartRepository;
import com.bazzar.repository.OrderRepository;
import com.bazzar.repository.ProductRepository;
import com.bazzar.repository.StoreAdminApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final StoreAdminApplicationRepository applicationRepository;
    private final ShiprocketService shiprocketService;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        ProductRepository productRepository,
                        ProductService productService,
                        StoreAdminApplicationRepository applicationRepository,
                        ShiprocketService shiprocketService,
                        EmailService emailService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.productService = productService;
        this.applicationRepository = applicationRepository;
        this.shiprocketService = shiprocketService;
        this.emailService = emailService;
    }

    private static class CartItemData {
        private final Product product;
        private final int quantity;

        public CartItemData(Product product, int quantity) {
            this.product = product;
            this.quantity = quantity;
        }

        public Product getProduct() {
            return product;
        }

        public int getQuantity() {
            return quantity;
        }
    }

    @Transactional
    public OrderResponse placeOrder(User user, OrderRequest request) {
        Cart cart = cartRepository.findByUser(user).orElse(null);

        List<CartItemData> itemsToProcess = new ArrayList<>();

        if (cart != null && cart.getItems() != null && !cart.getItems().isEmpty()) {
            for (CartItem cartItem : cart.getItems()) {
                itemsToProcess.add(new CartItemData(cartItem.getProduct(), cartItem.getQuantity()));
            }
        } else if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderRequest.OrderItemPayload itemPayload : request.getItems()) {
                if (itemPayload.getProductId() != null && itemPayload.getQuantity() != null && itemPayload.getQuantity() > 0) {
                    Product product = productRepository.findById(itemPayload.getProductId())
                            .orElseThrow(() -> new BadRequestException("Product not found with ID: " + itemPayload.getProductId()));
                    itemsToProcess.add(new CartItemData(product, itemPayload.getQuantity()));
                }
            }
        }

        if (itemsToProcess.isEmpty()) {
            throw new BadRequestException("Cannot place order: cart is empty");
        }

        // Verify stock for all items
        User seller = null;
        for (CartItemData item : itemsToProcess) {
            Product product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getStock());
            }
            if (seller == null && product.getStoreAdmin() != null) {
                seller = product.getStoreAdmin();
            }
        }

        // Determine Seller Pickup Logistics Details
        String pickupAddress = "Fulfillment Center, Bandra Kurla Complex";
        String pickupCity = "Mumbai";
        String pickupState = "Maharashtra";
        String pickupPostalCode = "400051";

        if (seller != null) {
            Optional<StoreAdminApplication> appOpt = applicationRepository.findByUserId(seller.getId());
            if (appOpt.isPresent()) {
                StoreAdminApplication app = appOpt.get();
                if (app.getPickupAddressLine1() != null && !app.getPickupAddressLine1().isBlank()) {
                    pickupAddress = app.getPickupAddressLine1();
                    if (app.getPickupAddressLine2() != null && !app.getPickupAddressLine2().isBlank()) {
                        pickupAddress += ", " + app.getPickupAddressLine2();
                    }
                }
                if (app.getPickupCity() != null && !app.getPickupCity().isBlank()) {
                    pickupCity = app.getPickupCity();
                }
                if (app.getPickupState() != null && !app.getPickupState().isBlank()) {
                    pickupState = app.getPickupState();
                }
                if (app.getPickupPostalCode() != null && !app.getPickupPostalCode().isBlank()) {
                    pickupPostalCode = app.getPickupPostalCode();
                }
            }
        }

        // Resolve coordinates
        double[] pickupCoords = shiprocketService.getCoordinates(pickupCity, pickupAddress, 19.0760, 72.8777);
        double[] deliveryCoords = shiprocketService.getCoordinates(request.getCity(), request.getAddress(), 28.6139, 77.2090);

        // Calculate total
        BigDecimal totalAmount = itemsToProcess.stream()
                .map(item -> item.getProduct().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String paymentMethod = (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank())
                ? request.getPaymentMethod().toUpperCase()
                : "RAZORPAY";

        String initialPaymentStatus = "COD".equalsIgnoreCase(paymentMethod) ? "COD_PENDING" : "PENDING";
        OrderStatus initialStatus = "COD".equalsIgnoreCase(paymentMethod) ? OrderStatus.CONFIRMED : OrderStatus.PLACED;
        String initialTracking = "COD".equalsIgnoreCase(paymentMethod) ? "MANIFESTED" : "PLACED";

        // Create order
        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .status(initialStatus)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .paymentMethod(paymentMethod)
                .paymentStatus(initialPaymentStatus)
                .trackingStatus(initialTracking)
                .pickupAddress(pickupAddress)
                .pickupCity(pickupCity)
                .pickupState(pickupState)
                .pickupPostalCode(pickupPostalCode)
                .pickupLat(pickupCoords[0])
                .pickupLng(pickupCoords[1])
                .deliveryLat(deliveryCoords[0])
                .deliveryLng(deliveryCoords[1])
                .items(new ArrayList<>())
                .build();
        order = orderRepository.save(order);

        // Create order items, reduce stock
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItemData item : itemsToProcess) {
            Product product = item.getProduct();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(product.getPrice()) // snapshot price at order time
                    .build();
            orderItems.add(orderItem);

            // Reduce stock
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }
        order.getItems().addAll(orderItems);

        // Generate Shiprocket shipment if COD
        if ("COD".equalsIgnoreCase(paymentMethod)) {
            try {
                Map<String, String> ship = shiprocketService.createShipment(order);
                order.setShipmentId(ship.get("shipmentId"));
                order.setAwbCode(ship.get("awbCode"));
                order.setCourierName(ship.get("courierName"));
            } catch (Exception ignored) {}
        }

        order = orderRepository.save(order);

        // Clear the backend cart if it had items
        if (cart != null && cart.getItems() != null && !cart.getItems().isEmpty()) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }

        // Send Order Placed Email to User
        try {
            emailService.sendOrderPlacedEmail(order);
        } catch (Exception ignored) {}

        return toResponse(order);
    }

    public List<OrderResponse> getUserOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getUserOrderById(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_SUPER_ADMIN) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        return toResponse(order);
    }

    public OrderTrackingResponse getOrderTracking(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_SUPER_ADMIN) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        return shiprocketService.getTrackingDetails(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setStatus(status);

        if (status == OrderStatus.CONFIRMED) {
            order.setTrackingStatus("MANIFESTED");
            if (order.getShipmentId() == null || order.getShipmentId().isBlank()) {
                try {
                    Map<String, String> ship = shiprocketService.createShipment(order);
                    order.setShipmentId(ship.get("shipmentId"));
                    order.setAwbCode(ship.get("awbCode"));
                    order.setCourierName(ship.get("courierName"));
                } catch (Exception ignored) {}
            }
        } else if (status == OrderStatus.SHIPPED) {
            order.setTrackingStatus("IN_TRANSIT");
        } else if (status == OrderStatus.DELIVERED) {
            order.setTrackingStatus("DELIVERED");
            if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
                order.setPaymentStatus("PAID");
            }
        }

        Order saved = orderRepository.save(order);

        // Send Email Notification to Customer
        try {
            emailService.sendOrderStatusUpdateEmail(saved, status.name());
        } catch (Exception ignored) {}

        return toResponse(saved);
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .product(productService.toResponse(item.getProduct()))
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .fullName(order.getFullName())
                .email(order.getEmail())
                .phoneNumber(order.getPhoneNumber())
                .address(order.getAddress())
                .city(order.getCity())
                .postalCode(order.getPostalCode())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .paymentId(order.getPaymentId())
                .razorpayOrderId(order.getRazorpayOrderId())
                .shipmentId(order.getShipmentId())
                .awbCode(order.getAwbCode())
                .courierName(order.getCourierName())
                .trackingStatus(order.getTrackingStatus())
                .pickupAddress(order.getPickupAddress())
                .pickupCity(order.getPickupCity())
                .pickupState(order.getPickupState())
                .pickupPostalCode(order.getPickupPostalCode())
                .pickupLat(order.getPickupLat())
                .pickupLng(order.getPickupLng())
                .deliveryLat(order.getDeliveryLat())
                .deliveryLng(order.getDeliveryLng())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
