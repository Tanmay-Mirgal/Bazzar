package com.bazzar.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Store profile created when a store admin application is approved.
 * One store per store_admin user.
 */
@Entity
@Table(name = "stores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user with ROLE_STORE_ADMIN who owns this store */
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "store_description", columnDefinition = "TEXT")
    private String storeDescription;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // ── Geolocation & Hyperlocal Delivery Capabilities ────────────────────────
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "is_quick_delivery_active")
    @Builder.Default
    private Boolean isQuickDeliveryActive = true;

    @Column(name = "store_reliability_score")
    @Builder.Default
    private Double storeReliabilityScore = 4.8;

    @Column(name = "preparation_time_mins")
    @Builder.Default
    private Integer preparationTimeMins = 3;

    @Column(name = "rider_availability_count")
    @Builder.Default
    private Integer riderAvailabilityCount = 5;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.isQuickDeliveryActive == null) {
            this.isQuickDeliveryActive = true;
        }
        if (this.storeReliabilityScore == null) {
            this.storeReliabilityScore = 4.8;
        }
        if (this.preparationTimeMins == null) {
            this.preparationTimeMins = 3;
        }
        if (this.riderAvailabilityCount == null) {
            this.riderAvailabilityCount = 5;
        }
    }
}
