package com.bazzar.entity;

public enum ProductStatus {
    PENDING,    // Submitted by store_admin, awaiting super_admin review
    APPROVED,   // Approved by super_admin — visible on main platform
    REJECTED    // Rejected by super_admin — not visible, reason provided
}
