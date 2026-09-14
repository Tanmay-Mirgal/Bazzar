package com.bazzar.dto.hyperlocal;

import com.bazzar.entity.DeliverySpeedTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOptionDTO {
    private DeliverySpeedTier tier;
    private Integer estimatedMinutes;
    private Integer minimumMinutes;
    private Integer maximumMinutes;
    private BigDecimal deliveryFee;
    private Boolean available;
    private String deliveryPromise; // e.g. "10_MIN", "20_MIN", "45_MIN", "1-2_DAYS"
    private String message;
}
