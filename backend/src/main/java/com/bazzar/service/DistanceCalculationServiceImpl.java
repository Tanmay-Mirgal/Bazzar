package com.bazzar.service;

import org.springframework.stereotype.Service;

@Service
public class DistanceCalculationServiceImpl implements DistanceCalculationService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double ROAD_CURVATURE_FACTOR = 1.30;

    @Override
    public double calculateAirDistanceKm(Double lat1, Double lng1, Double lat2, Double lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return 9999.0;
        }

        // Validate coordinate bounds
        if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90 ||
            lng1 < -180 || lng1 > 180 || lng2 < -180 || lng2 > 180) {
            return 9999.0;
        }

        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    @Override
    public double estimateRoadDistanceKm(double airDistanceKm) {
        if (airDistanceKm >= 9999.0) return 9999.0;
        return airDistanceKm * ROAD_CURVATURE_FACTOR;
    }

    @Override
    public int estimateTravelTimeMins(double roadDistanceKm, double avgSpeedKmH) {
        if (roadDistanceKm >= 9999.0 || avgSpeedKmH <= 0) return 999;
        double speed = Math.max(avgSpeedKmH, 15.0);
        return (int) Math.ceil((roadDistanceKm / speed) * 60.0);
    }
}
