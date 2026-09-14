package com.bazzar.service;

import com.bazzar.entity.DeliverySpeedTier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DeliveryFeeService {

    @Value("${hyperlocal.flash.fee:29}")
    private BigDecimal flashFee;

    @Value("${hyperlocal.fast.fee:19}")
    private BigDecimal fastFee;

    @Value("${hyperlocal.standard.fee:9}")
    private BigDecimal standardFee;

    @Value("${hyperlocal.standard.free-threshold:499}")
    private BigDecimal freeThreshold;

    public BigDecimal calculateFee(DeliverySpeedTier tier, BigDecimal cartTotal) {
        if (tier == null || tier == DeliverySpeedTier.UNAVAILABLE) {
            return BigDecimal.ZERO;
        }

        switch (tier) {
            case FLASH_10_MIN:
                return flashFee;
            case FAST_20_MIN:
                return fastFee;
            case STANDARD_45_MIN:
                if (cartTotal != null && cartTotal.compareTo(freeThreshold) >= 0) {
                    return BigDecimal.ZERO;
                }
                return standardFee;
            case NATIONAL_COURIER:
                return BigDecimal.ZERO;
            default:
                return standardFee;
        }
    }
}
