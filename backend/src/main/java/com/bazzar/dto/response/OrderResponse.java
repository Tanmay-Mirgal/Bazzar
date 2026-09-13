package com.bazzar.dto.response;

import com.bazzar.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String postalCode;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;

    // Payment Info
    private String paymentMethod;
    private String paymentStatus;
    private String paymentId;
    private String razorpayOrderId;

    // Logistics & Tracking Info
    private String shipmentId;
    private String awbCode;
    private String courierName;
    private String trackingStatus;

    // Location Coordinates
    private String pickupAddress;
    private String pickupCity;
    private String pickupState;
    private String pickupPostalCode;
    private Double pickupLat;
    private Double pickupLng;
    private Double deliveryLat;
    private Double deliveryLng;
}
