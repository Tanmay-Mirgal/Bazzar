package com.bazzar.entity;

public enum ApplicationStatus {
    PENDING,    // Submitted by user, awaiting review
    APPROVED,   // Approved — user promoted to ROLE_STORE_ADMIN
    REJECTED    // Rejected with a note from super_admin
}
