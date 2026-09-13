package com.bazzar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerAnalyticsResponse {

    private BigDecimal totalRevenue;
    private BigDecimal netEarnings;
    private BigDecimal platformFee;
    private BigDecimal availablePayout;
    private BigDecimal pendingPayout;
    private long totalOrders;
    private long unitsSold;
    private BigDecimal averageOrderValue;
    private long activeProducts;
    private long pendingApprovals;

    private Map<String, Long> ordersByStatus;
    private List<SalesTrendPoint> salesTrend;
    private List<CategoryBreakdownItem> categoryBreakdown;
    private List<TopProductItem> topProducts;
    private BankPayoutInfo bankPayout;
    private List<PayoutHistoryItem> payoutHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesTrendPoint {
        private String label;
        private BigDecimal revenue;
        private long orders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdownItem {
        private String categoryName;
        private long count;
        private BigDecimal revenue;
        private int percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductItem {
        private Long id;
        private String name;
        private String image;
        private BigDecimal price;
        private int stock;
        private long unitsSold;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BankPayoutInfo {
        private String bankName;
        private String accountHolderName;
        private String accountNumberMasked;
        private String ifscCode;
        private String settlementCycle;
        private String nextPayoutDate;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayoutHistoryItem {
        private String payoutId;
        private String date;
        private BigDecimal amount;
        private String referenceNumber;
        private String status;
        private String bankName;
    }
}
