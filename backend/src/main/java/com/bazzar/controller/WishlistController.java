package com.bazzar.controller;

import com.bazzar.config.ClerkUserResolver;
import com.bazzar.dto.response.ProductResponse;
import com.bazzar.entity.User;
import com.bazzar.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;
    private final ClerkUserResolver clerkUserResolver;

    public WishlistController(WishlistService wishlistService, ClerkUserResolver clerkUserResolver) {
        this.wishlistService = wishlistService;
        this.clerkUserResolver = clerkUserResolver;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getWishlist(@AuthenticationPrincipal Jwt jwt) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(wishlistService.getWishlist(user));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<List<ProductResponse>> addToWishlist(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long productId) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(wishlistService.addToWishlist(user, productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<List<ProductResponse>> removeFromWishlist(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long productId) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(wishlistService.removeFromWishlist(user, productId));
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<Map<String, Boolean>> isInWishlist(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long productId) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return ResponseEntity.ok(Map.of("inWishlist", wishlistService.isInWishlist(user, productId)));
    }
}
