package com.bazzar.controller;

import com.bazzar.dto.request.ProductRequest;
import com.bazzar.dto.request.StoreAdminApplicationRequest;
import com.bazzar.dto.response.*;
import com.bazzar.service.StoreAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST endpoints for store admin operations.
 * All endpoints require ROLE_STORE_ADMIN or ROLE_SUPER_ADMIN (enforced by SecurityConfig).
 *
 * Exception: /apply and /application/status are accessible by authenticated regular users too.
 */
@RestController
@RequestMapping("/api/store-admin")
public class StoreAdminController {

    private final StoreAdminService storeAdminService;

    public StoreAdminController(StoreAdminService storeAdminService) {
        this.storeAdminService = storeAdminService;
    }

    // ── APPLICATION (any authenticated user can apply) ───────────────────────

    @PostMapping("/apply")
    public ResponseEntity<StoreAdminApplicationResponse> apply(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody StoreAdminApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeAdminService.submitApplication(jwt, request));
    }

    @GetMapping("/application/status")
    public ResponseEntity<StoreAdminApplicationResponse> getApplicationStatus(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(storeAdminService.getMyApplication(jwt));
    }

    // ── PRODUCTS ─────────────────────────────────────────────────────────────

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getMyProducts(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(storeAdminService.getMyProducts(jwt));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> addProduct(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeAdminService.addProduct(jwt, request));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(storeAdminService.updateProduct(jwt, id, request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id) {
        storeAdminService.deleteProduct(jwt, id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    // ── STORE SETTINGS ───────────────────────────────────────────────────────

    @GetMapping("/store")
    public ResponseEntity<StoreResponse> getMyStore(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(storeAdminService.getMyStore(jwt));
    }

    @PatchMapping("/store")
    public ResponseEntity<StoreResponse> updateStore(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(storeAdminService.updateStore(
                jwt,
                body.get("storeName"),
                body.get("storeDescription"),
                body.get("logoUrl")));
    }

    // ── ORDERS ───────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(storeAdminService.getMyOrders(jwt));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank()) {
            throw new com.bazzar.exception.BadRequestException("Status is required");
        }
        com.bazzar.entity.OrderStatus status = com.bazzar.entity.OrderStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(storeAdminService.updateMyOrderStatus(jwt, id, status));
    }

    // ── ANALYTICS ────────────────────────────────────────────────────────────

    @GetMapping("/analytics")
    public ResponseEntity<SellerAnalyticsResponse> getMyAnalytics(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(storeAdminService.getMyAnalytics(jwt));
    }

    // ── DASHBOARD STATS ──────────────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(storeAdminService.getMyStats(jwt));
    }
}
