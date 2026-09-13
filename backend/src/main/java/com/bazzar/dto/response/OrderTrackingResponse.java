package com.bazzar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingResponse {
    private Long orderId;
    private String status;
    private String trackingStatus;
    private String awbCode;
    private String courierName;
    private String estimatedDelivery;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;

    private LocationPoint origin;
    private LocationPoint destination;
    private CurrentLocationPoint currentLocation;
    private List<List<Double>> routeCoordinates;
    private List<TrackingCheckpoint> checkpoints;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationPoint {
        private String title;
        private String address;
        private String city;
        private String state;
        private String postalCode;
        private Double lat;
        private Double lng;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentLocationPoint {
        private Double lat;
        private Double lng;
        private String description;
        private String statusText;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackingCheckpoint {
        private String status;
        private String title;
        private String description;
        private String location;
        private String timestamp;
        private boolean completed;
        private boolean isCurrent;
    }
}
