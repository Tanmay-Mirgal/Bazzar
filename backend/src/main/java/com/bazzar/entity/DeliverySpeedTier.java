package com.bazzar.entity;

/**
 * Hyperlocal & Quick Commerce delivery speed promises.
 */
public enum DeliverySpeedTier {
    FLASH_10_MIN,      // 0–2 km, Target 10 mins, ₹29 fee
    FAST_20_MIN,       // 2–5 km, Target 15–20 mins, ₹19 fee
    STANDARD_45_MIN,   // 5–10 km, Target 30–45 mins, ₹9 fee (Free >= ₹499)
    NATIONAL_COURIER,  // > 10 km, Standard courier 1–2 days
    UNAVAILABLE
}
