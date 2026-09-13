package com.bazzar.dto.response;

import com.bazzar.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String image;
    private CategoryResponse category;
    private ProductStatus status;
    private String rejectionReason;
    private Long storeAdminId;
    private String storeAdminName;
    private String storeName;
    private String sellerEmail;
    private String sellerPhone;
    private String sellerPickupLocation;
    private String sellerPan;
    private String sellerGst;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
