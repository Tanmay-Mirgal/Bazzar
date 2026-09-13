package com.bazzar.controller;

import com.bazzar.dto.response.*;
import com.bazzar.entity.ApplicationStatus;
import com.bazzar.service.SuperAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST endpoints for super admin operations.
 * All endpoints require ROLE_SUPER_ADMIN (enforced by SecurityConfig).
 */
@RestController
@RequestMapping("/api/super-admin")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    public SuperAdminController(SuperAdminService superAdminService) {
        this.superAdminService = superAdminService;
    }

    // ── DASHBOARD STATS ──────────────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getPlatformStats() {
        return ResponseEntity.ok(superAdminService.getPlatformStats());
    }

    // ── APPLICATIONS ─────────────────────────────────────────────────────────

    @GetMapping("/applications")
    public ResponseEntity<List<StoreAdminApplicationResponse>> getAllApplications(
            @RequestParam(required = false) String status) {
        if (status != null) {
            ApplicationStatus appStatus = ApplicationStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(superAdminService.getApplicationsByStatus(appStatus));
        }
        return ResponseEntity.ok(superAdminService.getAllApplications());
    }

    @PutMapping("/applications/{id}/approve")
    public ResponseEntity<StoreAdminApplicationResponse> approveApplication(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.getOrDefault("note", "") : "";
        return ResponseEntity.ok(superAdminService.approveApplication(id, note));
    }

    @PutMapping("/applications/{id}/reject")
    public ResponseEntity<StoreAdminApplicationResponse> rejectApplication(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String note = (body != null && body.containsKey("note")) ? body.get("note") : "";
        return ResponseEntity.ok(superAdminService.rejectApplication(id, note));
    }

    // ── PRODUCTS ─────────────────────────────────────────────────────────────

    @GetMapping("/products/pending")
    public ResponseEntity<List<ProductResponse>> getPendingProducts() {
        return ResponseEntity.ok(superAdminService.getPendingProducts());
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SuperAdminController.class);

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(@RequestParam(required = false) String status) {
        try {
            if ("PENDING".equalsIgnoreCase(status)) {
                return ResponseEntity.ok(superAdminService.getPendingProducts());
            }
            return ResponseEntity.ok(superAdminService.getAllProducts());
        } catch (Exception e) {
            log.error("Failed to fetch products for super-admin: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/products/{id}/approve")
    public ResponseEntity<ProductResponse> approveProduct(@PathVariable Long id) {
        return ResponseEntity.ok(superAdminService.approveProduct(id));
    }

    @PutMapping("/products/{id}/reject")
    public ResponseEntity<ProductResponse> rejectProduct(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "";
        return ResponseEntity.ok(superAdminService.rejectProduct(id, reason));
    }

    // ── USERS ────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(superAdminService.getAllUsers());
    }

    // ── STORES ───────────────────────────────────────────────────────────────

    @GetMapping("/stores")
    public ResponseEntity<List<StoreResponse>> getAllStores() {
        return ResponseEntity.ok(superAdminService.getAllStores());
    }

    @PatchMapping("/stores/{id}/toggle")
    public ResponseEntity<StoreResponse> toggleStore(@PathVariable Long id) {
        return ResponseEntity.ok(superAdminService.toggleStoreActive(id));
    }

    // ── ORDERS ───────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(superAdminService.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        com.bazzar.entity.OrderStatus status = com.bazzar.entity.OrderStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(superAdminService.updateOrderStatus(id, status));
    }
}
