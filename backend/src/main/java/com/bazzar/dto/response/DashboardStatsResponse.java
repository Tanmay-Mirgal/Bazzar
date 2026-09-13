package com.bazzar.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    // Platform-wide (super_admin view)
    private long totalUsers;
    private long totalStores;
    private long totalProducts;
    private long totalOrders;
    private long pendingApplications;
    private long pendingProducts;
    private long approvedProducts;
    private long rejectedProducts;

    // Store-specific (store_admin view)
    private long myProducts;
    private long myPendingProducts;
    private long myApprovedProducts;
    private long myRejectedProducts;
    private long myTotalOrders;
    private java.math.BigDecimal myTotalRevenue;
    private long myUnitsSold;
    private java.math.BigDecimal myPendingPayout;
}
