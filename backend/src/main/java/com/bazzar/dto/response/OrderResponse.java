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
}
