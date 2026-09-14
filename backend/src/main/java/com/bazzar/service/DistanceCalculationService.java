package com.bazzar.service;

public interface DistanceCalculationService {
    double calculateAirDistanceKm(Double lat1, Double lng1, Double lat2, Double lng2);
    double estimateRoadDistanceKm(double airDistanceKm);
    int estimateTravelTimeMins(double roadDistanceKm, double avgSpeedKmH);
}
