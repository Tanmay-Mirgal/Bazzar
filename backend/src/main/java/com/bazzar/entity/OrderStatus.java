package com.bazzar.entity;

public enum OrderStatus {
    CREATED,
    PAYMENT_CONFIRMED,
    STORE_ASSIGNED,
    PICKING,
    PACKED,
    RIDER_ASSIGNING,
    RIDER_ASSIGNED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    FAILED,
    
    // Legacy support
    PLACED,
    CONFIRMED,
    SHIPPED
}
