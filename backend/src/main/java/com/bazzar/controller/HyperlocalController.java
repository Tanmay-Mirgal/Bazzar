package com.bazzar.controller;

import com.bazzar.dto.hyperlocal.DeliveryEstimateResponse;
import com.bazzar.dto.hyperlocal.NearbyStoreDTO;
import com.bazzar.service.HyperlocalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/hyperlocal")
public class HyperlocalController {

    private final HyperlocalService hyperlocalService;

    public HyperlocalController(HyperlocalService hyperlocalService) {
        this.hyperlocalService = hyperlocalService;
    }

    @GetMapping("/estimate")
    public ResponseEntity<DeliveryEstimateResponse> getEstimate(
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false) List<Long> productIds,
            @RequestParam(required = false) List<Integer> quantities,
            @RequestParam(required = false) BigDecimal cartTotal) {
        DeliveryEstimateResponse response = hyperlocalService.getDeliveryEstimate(
                userLat, userLng, productIds, quantities, cartTotal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nearby-stores")
    public ResponseEntity<List<NearbyStoreDTO>> getNearbyStores(
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLng,
            @RequestParam(required = false, defaultValue = "10.0") Double radius) {
        List<NearbyStoreDTO> stores = hyperlocalService.getNearbyStores(userLat, userLng, radius);
        return ResponseEntity.ok(stores);
    }
}
