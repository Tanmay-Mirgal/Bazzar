package com.bazzar.service;

import com.bazzar.dto.hyperlocal.*;
import com.bazzar.entity.DeliverySpeedTier;
import com.bazzar.entity.Product;
import com.bazzar.entity.Store;
import com.bazzar.repository.ProductRepository;
import com.bazzar.repository.StoreRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HyperlocalService {

    private static final Logger log = LoggerFactory.getLogger(HyperlocalService.class);

    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final DistanceCalculationService distanceService;
    private final DeliveryFeeService feeService;

    @Value("${hyperlocal.flash.radius-km:2.0}")
    private double flashRadiusKm;

    @Value("${hyperlocal.fast.radius-km:5.0}")
    private double fastRadiusKm;

    @Value("${hyperlocal.standard.radius-km:10.0}")
    private double standardRadiusKm;

    @Value("${hyperlocal.flash.target-minutes:10}")
    private int flashTargetMins;

    @Value("${hyperlocal.fast.target-minutes:20}")
    private int fastTargetMins;

    @Value("${hyperlocal.standard.target-minutes:45}")
    private int standardTargetMins;

    @Value("${hyperlocal.weights.distance:0.30}")
    private double distanceWeight;

    @Value("${hyperlocal.weights.stock:0.25}")
    private double stockWeight;

    @Value("${hyperlocal.weights.eta:0.25}")
    private double etaWeight;

    @Value("${hyperlocal.weights.rider:0.10}")
    private double riderWeight;

    @Value("${hyperlocal.weights.reliability:0.10}")
    private double reliabilityWeight;

    public HyperlocalService(StoreRepository storeRepository,
                             ProductRepository productRepository,
                             DistanceCalculationService distanceService,
                             DeliveryFeeService feeService) {
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.distanceService = distanceService;
        this.feeService = feeService;
    }

    private static class CandidateEval {
        Store store;
        double airDistanceKm;
        double roadDistanceKm;
        int estimatedMinutes;
        double stockMatchRatio;
        double score;
    }

    public DeliveryEstimateResponse getDeliveryEstimate(Double userLat, Double userLng,
                                                         List<Long> productIds,
                                                         List<Integer> quantities,
                                                         BigDecimal cartTotal) {
        if (cartTotal == null) cartTotal = BigDecimal.ZERO;

        // Default coordinate fallbacks if null or invalid (e.g. Mumbai center)
        double lat = (userLat != null && userLat >= -90 && userLat <= 90) ? userLat : 18.9986;
        double lng = (userLng != null && userLng >= -180 && userLng <= 180) ? userLng : 72.8550;

        List<Store> activeStores = storeRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .collect(Collectors.toList());

        // Fetch required product entities
        List<Product> requiredProducts = (productIds != null && !productIds.isEmpty())
                ? productRepository.findAllById(productIds)
                : Collections.emptyList();

        Map<Long, Integer> qtyMap = new HashMap<>();
        if (productIds != null) {
            for (int i = 0; i < productIds.size(); i++) {
                int q = (quantities != null && i < quantities.size() && quantities.get(i) != null) ? quantities.get(i) : 1;
                qtyMap.put(productIds.get(i), q);
            }
        }

        // Evaluate all candidate stores
        List<CandidateEval> candidates = new ArrayList<>();
        for (Store store : activeStores) {
            double storeLat = store.getLatitude() != null ? store.getLatitude() : 19.2968;
            double storeLng = store.getLongitude() != null ? store.getLongitude() : 73.0631;

            double airDist = distanceService.calculateAirDistanceKm(lat, lng, storeLat, storeLng);
            double roadDist = distanceService.estimateRoadDistanceKm(airDist);
            int prepMins = store.getPreparationTimeMins() != null ? store.getPreparationTimeMins() : 3;
            int transitMins = distanceService.estimateTravelTimeMins(roadDist, 22.0); // 22 km/h avg rider speed
            int totalMins = prepMins + 1 + transitMins;

            // Basket inventory match score
            double stockScore = 1.0;
            if (!requiredProducts.isEmpty()) {
                long inStockCount = requiredProducts.stream()
                        .filter(p -> p.getStoreAdmin() != null && p.getStoreAdmin().getId().equals(store.getUser().getId()))
                        .filter(p -> p.getStock() >= qtyMap.getOrDefault(p.getId(), 1))
                        .count();
                stockScore = (double) inStockCount / requiredProducts.size();
            }

            double distScore = Math.max(0, 1.0 - (airDist / 15.0));
            double etaScore = Math.max(0, 1.0 - (totalMins / 60.0));
            double riderScore = store.getRiderAvailabilityCount() != null ? Math.min(1.0, store.getRiderAvailabilityCount() / 5.0) : 0.8;
            double relScore = store.getStoreReliabilityScore() != null ? store.getStoreReliabilityScore() / 5.0 : 0.9;

            double finalScore = (distanceWeight * distScore) +
                                (stockWeight * stockScore) +
                                (etaWeight * etaScore) +
                                (riderWeight * riderScore) +
                                (reliabilityWeight * relScore);

            CandidateEval eval = new CandidateEval();
            eval.store = store;
            eval.airDistanceKm = airDist;
            eval.roadDistanceKm = roadDist;
            eval.estimatedMinutes = totalMins;
            eval.stockMatchRatio = stockScore;
            eval.score = finalScore;
            candidates.add(eval);
        }

        // Sort candidates by highest fulfillment score
        candidates.sort((a, b) -> Double.compare(b.score, a.score));

        // Evaluate Dynamic Rings
        DeliverySpeedTier chosenTier = DeliverySpeedTier.NATIONAL_COURIER;
        CandidateEval bestCandidate = null;

        // Tier 1: 0 - 2 km (FLASH 10 MIN)
        Optional<CandidateEval> tier1 = candidates.stream()
                .filter(c -> c.airDistanceKm <= flashRadiusKm && Boolean.TRUE.equals(c.store.getIsQuickDeliveryActive()) && c.stockMatchRatio >= 0.99)
                .findFirst();

        if (tier1.isPresent()) {
            chosenTier = DeliverySpeedTier.FLASH_10_MIN;
            bestCandidate = tier1.get();
        } else {
            // Tier 2: 2 - 5 km (FAST 20 MIN)
            Optional<CandidateEval> tier2 = candidates.stream()
                    .filter(c -> c.airDistanceKm <= fastRadiusKm && Boolean.TRUE.equals(c.store.getIsQuickDeliveryActive()) && c.stockMatchRatio >= 0.99)
                    .findFirst();
            if (tier2.isPresent()) {
                chosenTier = DeliverySpeedTier.FAST_20_MIN;
                bestCandidate = tier2.get();
            } else {
                // Tier 3: 5 - 10 km (STANDARD 45 MIN)
                Optional<CandidateEval> tier3 = candidates.stream()
                        .filter(c -> c.airDistanceKm <= standardRadiusKm && c.stockMatchRatio >= 0.99)
                        .findFirst();
                if (tier3.isPresent()) {
                    chosenTier = DeliverySpeedTier.STANDARD_45_MIN;
                    bestCandidate = tier3.get();
                } else if (!candidates.isEmpty()) {
                    bestCandidate = candidates.get(0);
                }
            }
        }

        int estMins = (bestCandidate != null) ? Math.max(8, bestCandidate.estimatedMinutes) : 45;
        if (chosenTier == DeliverySpeedTier.FLASH_10_MIN) estMins = Math.min(estMins, 10);
        else if (chosenTier == DeliverySpeedTier.FAST_20_MIN) estMins = Math.min(estMins, 20);

        BigDecimal fee = feeService.calculateFee(chosenTier, cartTotal);
        LocalDateTime deadline = LocalDateTime.now().plusMinutes(estMins);

        FulfillmentStoreDTO storeDTO = null;
        if (bestCandidate != null && bestCandidate.store != null) {
            storeDTO = FulfillmentStoreDTO.builder()
                    .id(bestCandidate.store.getId())
                    .name(bestCandidate.store.getStoreName())
                    .distanceKm(Math.round(bestCandidate.airDistanceKm * 10.0) / 10.0)
                    .latitude(bestCandidate.store.getLatitude())
                    .longitude(bestCandidate.store.getLongitude())
                    .build();
        }

        // Generate Available Options
        List<DeliveryOptionDTO> options = new ArrayList<>();
        options.add(DeliveryOptionDTO.builder()
                .tier(DeliverySpeedTier.FLASH_10_MIN)
                .estimatedMinutes(10)
                .minimumMinutes(8)
                .maximumMinutes(12)
                .deliveryFee(feeService.calculateFee(DeliverySpeedTier.FLASH_10_MIN, cartTotal))
                .available(tier1.isPresent())
                .deliveryPromise("10_MIN")
                .message("⚡ 10-Min Flash Delivery from nearest dark store")
                .build());

        options.add(DeliveryOptionDTO.builder()
                .tier(DeliverySpeedTier.FAST_20_MIN)
                .estimatedMinutes(18)
                .minimumMinutes(15)
                .maximumMinutes(22)
                .deliveryFee(feeService.calculateFee(DeliverySpeedTier.FAST_20_MIN, cartTotal))
                .available(chosenTier == DeliverySpeedTier.FLASH_10_MIN || chosenTier == DeliverySpeedTier.FAST_20_MIN)
                .deliveryPromise("20_MIN")
                .message("⚡ 15-20 Min Fast Hyperlocal Delivery")
                .build());

        options.add(DeliveryOptionDTO.builder()
                .tier(DeliverySpeedTier.STANDARD_45_MIN)
                .estimatedMinutes(35)
                .minimumMinutes(30)
                .maximumMinutes(45)
                .deliveryFee(feeService.calculateFee(DeliverySpeedTier.STANDARD_45_MIN, cartTotal))
                .available(true)
                .deliveryPromise("45_MIN")
                .message("🚚 Standard Hyperlocal Delivery (Free over ₹499)")
                .build());

        options.add(DeliveryOptionDTO.builder()
                .tier(DeliverySpeedTier.NATIONAL_COURIER)
                .estimatedMinutes(2880) // 2 days
                .minimumMinutes(1440)
                .maximumMinutes(2880)
                .deliveryFee(BigDecimal.ZERO)
                .available(true)
                .deliveryPromise("1-2_DAYS")
                .message("📦 Shiprocket National Express Courier")
                .build());

        String msg = switch (chosenTier) {
            case FLASH_10_MIN -> "Lightning-fast 10-minute delivery available from nearby dark store";
            case FAST_20_MIN -> "Fast 15-20 minute hyperlocal delivery available";
            case STANDARD_45_MIN -> "Standard 30-45 minute hyperlocal delivery available";
            default -> "Standard regional courier delivery (1-2 days)";
        };

        return DeliveryEstimateResponse.builder()
                .eligible(chosenTier != DeliverySpeedTier.UNAVAILABLE)
                .tier(chosenTier)
                .estimatedMinutes(estMins)
                .minimumMinutes(Math.max(5, estMins - 2))
                .maximumMinutes(estMins + 3)
                .deliveryFee(fee)
                .store(storeDTO)
                .message(msg)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .deliveryDeadline(deadline)
                .options(options)
                .build();
    }

    public List<NearbyStoreDTO> getNearbyStores(Double userLat, Double userLng, Double radiusKm) {
        double lat = (userLat != null && userLat >= -90 && userLat <= 90) ? userLat : 18.9986;
        double lng = (userLng != null && userLng >= -180 && userLng <= 180) ? userLng : 72.8550;
        double r = (radiusKm != null && radiusKm > 0) ? radiusKm : 10.0;

        return storeRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .map(s -> {
                    double sLat = s.getLatitude() != null ? s.getLatitude() : 19.2968;
                    double sLng = s.getLongitude() != null ? s.getLongitude() : 73.0631;
                    double dist = distanceService.calculateAirDistanceKm(lat, lng, sLat, sLng);
                    int prep = s.getPreparationTimeMins() != null ? s.getPreparationTimeMins() : 3;
                    int transit = distanceService.estimateTravelTimeMins(distanceService.estimateRoadDistanceKm(dist), 22.0);

                    return NearbyStoreDTO.builder()
                            .id(s.getId())
                            .name(s.getStoreName())
                            .latitude(sLat)
                            .longitude(sLng)
                            .distanceKm(Math.round(dist * 10.0) / 10.0)
                            .quickDelivery(s.getIsQuickDeliveryActive())
                            .estimatedMinutes(prep + transit + 1)
                            .build();
                })
                .filter(dto -> dto.getDistanceKm() <= r)
                .sorted(Comparator.comparing(NearbyStoreDTO::getDistanceKm))
                .collect(Collectors.toList());
    }
}
