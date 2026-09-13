package com.bazzar.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class StoreResponse {
    private Long id;
    private Long userId;
    private String ownerName;
    private String ownerEmail;
    private String storeName;
    private String storeDescription;
    private String logoUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private long totalProducts;
}
