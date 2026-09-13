package com.bazzar.dto.response;

import com.bazzar.entity.ApplicationStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class StoreAdminApplicationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String businessName;
    private String businessType;
    private String businessRegistrationType;
    private String businessDescription;
    private String contactPhone;
    private String gstNumber;
    private String panNumber;
    private String websiteUrl;

    // Pickup Warehouse Details
    private String pickupContactName;
    private String pickupContactPhone;
    private String pickupAddressLine1;
    private String pickupAddressLine2;
    private String pickupCity;
    private String pickupState;
    private String pickupPostalCode;
    private String pickupLandmark;

    // Bank Payout Details
    private String bankAccountHolderName;
    private String bankName;
    private String bankAccountNumber;
    private String bankIfscCode;

    private ApplicationStatus status;
    private String superAdminNote;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
