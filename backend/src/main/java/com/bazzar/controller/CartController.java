package com.bazzar.controller;

import com.bazzar.config.ClerkUserResolver;
import com.bazzar.dto.request.CartItemRequest;
import com.bazzar.dto.response.CartResponse;
import com.bazzar.entity.User;
import com.bazzar.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final ClerkUserResolver clerkUserResolver;

    public CartController(CartService cartService, ClerkUserResolver clerkUserResolver) {
        this.cartService = cartService;
        this.clerkUserResolver = clerkUserResolver;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal Jwt jwt) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CartItemRequest request) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(cartService.addItem(user, request));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<CartResponse> updateItem(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody CartItemRequest request) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(cartService.updateItem(user, id, request));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<CartResponse> removeItem(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(cartService.removeItem(user, id));
    }
}
