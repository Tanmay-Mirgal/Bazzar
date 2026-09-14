package com.bazzar.dto.hyperlocal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FulfillmentStoreDTO {
    private Long id;
    private String name;
    private Double distanceKm;
    private Double latitude;
    private Double longitude;
}
