package com.bazzar.dto.hyperlocal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyStoreDTO {
    private Long id;
    private String name;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
    private Boolean quickDelivery;
    private Integer estimatedMinutes;
}
