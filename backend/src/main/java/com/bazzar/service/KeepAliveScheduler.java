package com.bazzar.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class KeepAliveScheduler {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveScheduler.class);
    private final RestTemplate restTemplate;

    @Value("${server.port:8080}")
    private String serverPort;

    public KeepAliveScheduler() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Runs every 10 minutes (600,000 milliseconds) to prevent Render free-tier containers
     * from spinning down after 15 minutes of inactivity.
     */
    @Scheduled(fixedRate = 600000, initialDelay = 60000)
    public void pingSelfHealthEndpoint() {
        try {
            String renderUrl = System.getenv("RENDER_EXTERNAL_URL");
            String appBaseUrl = System.getenv("APP_BASE_URL");

            String targetUrl;
            if (renderUrl != null && !renderUrl.trim().isEmpty()) {
                targetUrl = renderUrl.endsWith("/") ? renderUrl + "api/health" : renderUrl + "/api/health";
            } else if (appBaseUrl != null && !appBaseUrl.trim().isEmpty()) {
                targetUrl = appBaseUrl.endsWith("/") ? appBaseUrl + "api/health" : appBaseUrl + "/api/health";
            } else {
                targetUrl = "http://localhost:" + serverPort + "/api/health";
            }

            logger.info("[Render Keep-Alive] Pinging health endpoint: {}", targetUrl);
            String response = restTemplate.getForObject(targetUrl, String.class);
            logger.info("[Render Keep-Alive] Self ping response: {}", response);
        } catch (Exception e) {
            logger.warn("[Render Keep-Alive] Self ping notice: {}", e.getMessage());
        }
    }
}
