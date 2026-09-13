package com.bazzar.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Represents a user's application to become a store admin.
 * Submitted by ROLE_USER, reviewed and approved/rejected by ROLE_SUPER_ADMIN.
 */
@Entity
@Table(name = "store_admin_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreAdminApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who submitted the application */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "business_type", nullable = false)
    private String businessType;

    @Column(name = "business_registration_type")
    private String businessRegistrationType;

    @Column(name = "business_description", columnDefinition = "TEXT")
    private String businessDescription;

    @Column(name = "contact_phone", nullable = false)
    private String contactPhone;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "website_url")
    private String websiteUrl;

    // ── PICKUP / WAREHOUSE LOGISTICS DETAILS ───────────────────────────
    @Column(name = "pickup_contact_name")
    private String pickupContactName;

    @Column(name = "pickup_contact_phone")
    private String pickupContactPhone;

    @Column(name = "pickup_address_line1")
    private String pickupAddressLine1;

    @Column(name = "pickup_address_line2")
    private String pickupAddressLine2;

    @Column(name = "pickup_city")
    private String pickupCity;

    @Column(name = "pickup_state")
    private String pickupState;

    @Column(name = "pickup_postal_code")
    private String pickupPostalCode;

    @Column(name = "pickup_landmark")
    private String pickupLandmark;

    // ── BANK ACCOUNT / PAYOUT DETAILS ──────────────────────────────────
    @Column(name = "bank_account_holder_name")
    private String bankAccountHolderName;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "bank_ifsc_code")
    private String bankIfscCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    /** Note from super_admin when approving/rejecting */
    @Column(name = "super_admin_note", columnDefinition = "TEXT")
    private String superAdminNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ApplicationStatus.PENDING;
        }
    }
}
