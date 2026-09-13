package com.bazzar.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StoreAdminApplicationRequest {

    // ── Business Details ──────────────────────────────────────────────
    @NotBlank(message = "Business / Store name is required")
    private String businessName;

    @NotBlank(message = "Business category / type is required")
    private String businessType;

    private String businessRegistrationType;

    @NotBlank(message = "Business description is required")
    private String businessDescription;

    @NotBlank(message = "Contact phone is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String contactPhone;

    private String websiteUrl;

    // ── Legal / Tax KYC ───────────────────────────────────────────────
    private String gstNumber;

    @NotBlank(message = "PAN number is required for seller KYC")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "Enter a valid 10-character PAN number (e.g. ABCDE1234F)")
    private String panNumber;

    // ── Courier / Logistics Pickup Warehouse Address ──────────────────
    @NotBlank(message = "Pickup contact person name is required")
    private String pickupContactName;

    @NotBlank(message = "Pickup contact phone is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number for pickup coordination")
    private String pickupContactPhone;

    @NotBlank(message = "Pickup address line 1 is required")
    private String pickupAddressLine1;

    private String pickupAddressLine2;

    @NotBlank(message = "Pickup city is required")
    private String pickupCity;

    @NotBlank(message = "Pickup state is required")
    private String pickupState;

    @NotBlank(message = "Pickup PIN code is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Enter a valid 6-digit Indian PIN code")
    private String pickupPostalCode;

    private String pickupLandmark;

    // ── Payout / Bank Account Details ─────────────────────────────────
    @NotBlank(message = "Bank account holder name is required")
    private String bankAccountHolderName;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "Bank account number is required")
    private String bankAccountNumber;

    @NotBlank(message = "Bank IFSC code is required")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Enter a valid 11-character IFSC code (e.g. HDFC0001234)")
    private String bankIfscCode;
}
