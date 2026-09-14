package com.bazzar.dto.hyperlocal;

import com.bazzar.entity.DeliverySpeedTier;
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
public class DeliveryEstimateResponse {
    private Boolean eligible;
    private DeliverySpeedTier tier;
    private Integer estimatedMinutes;
    private Integer minimumMinutes;
    private Integer maximumMinutes;
    private BigDecimal deliveryFee;
    private FulfillmentStoreDTO store;
    private String message;
    private LocalDateTime expiresAt;
    private LocalDateTime deliveryDeadline; // Server-authoritative deadline
    private List<DeliveryOptionDTO> options;
}
