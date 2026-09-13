package com.bazzar.controller;

import com.bazzar.config.ClerkUserResolver;
import com.bazzar.dto.request.OrderRequest;
import com.bazzar.dto.response.OrderResponse;
import com.bazzar.dto.response.OrderTrackingResponse;
import com.bazzar.entity.User;
import com.bazzar.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final ClerkUserResolver clerkUserResolver;

    public OrderController(OrderService orderService, ClerkUserResolver clerkUserResolver) {
        this.orderService = orderService;
        this.clerkUserResolver = clerkUserResolver;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OrderRequest request) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        OrderResponse response = orderService.placeOrder(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(@AuthenticationPrincipal Jwt jwt) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(orderService.getUserOrders(user));
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getUserOrderById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(orderService.getUserOrderById(user, id));
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<OrderTrackingResponse> getOrderTracking(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(orderService.getOrderTracking(user, id));
    }
}
