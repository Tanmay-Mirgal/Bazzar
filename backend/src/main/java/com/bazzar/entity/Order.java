package com.bazzar.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(name = "postal_code", nullable = false)
    private String postalCode;

    // ── Hyperlocal Delivery Tier & Authoritative Deadline ────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_speed_tier")
    private DeliverySpeedTier deliverySpeedTier;

    @Column(name = "delivery_fee", precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    @Column(name = "delivery_deadline")
    private LocalDateTime deliveryDeadline;

    @Column(name = "fulfillment_score")
    private Double fulfillmentScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_store_id")
    private Store assignedStore;

    // ── Payment Details (Razorpay / COD) ─────────────────────────────────────
    @Column(name = "payment_method")
    private String paymentMethod; // "RAZORPAY", "COD"

    @Column(name = "payment_status")
    private String paymentStatus; // "PENDING", "PAID", "FAILED", "COD_PENDING"

    @Column(name = "payment_id")
    private String paymentId; // Razorpay payment ID (pay_...)

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId; // Razorpay order ID (order_...)

    // ── Shipping & Logistics (Shiprocket) ────────────────────────────────────
    @Column(name = "shipment_id")
    private String shipmentId; // Shiprocket shipment ID

    @Column(name = "awb_code")
    private String awbCode; // Shiprocket AWB tracking code

    @Column(name = "courier_name")
    private String courierName; // "Delhivery", "Blue Dart", etc.

    @Column(name = "tracking_status")
    private String trackingStatus; // "PLACED", "MANIFESTED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"

    // ── Pickup Origin (Seller Store / Warehouse Location) ────────────────────
    @Column(name = "pickup_address")
    private String pickupAddress;

    @Column(name = "pickup_city")
    private String pickupCity;

    @Column(name = "pickup_state")
    private String pickupState;

    @Column(name = "pickup_postal_code")
    private String pickupPostalCode;

    @Column(name = "pickup_lat")
    private Double pickupLat;

    @Column(name = "pickup_lng")
    private Double pickupLng;

    // ── Delivery Destination Coordinates ─────────────────────────────────────
    @Column(name = "delivery_lat")
    private Double deliveryLat;

    @Column(name = "delivery_lng")
    private Double deliveryLng;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = OrderStatus.PLACED;
        }
        if (this.paymentStatus == null) {
            this.paymentStatus = "PENDING";
        }
        if (this.trackingStatus == null) {
            this.trackingStatus = "PLACED";
        }
        if (this.deliverySpeedTier == null) {
            this.deliverySpeedTier = DeliverySpeedTier.STANDARD_45_MIN;
        }
    }
}
