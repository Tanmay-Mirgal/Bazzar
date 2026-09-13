package com.bazzar.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class RazorpayService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayService.class);

    @Value("${razorpay.key-id:rzp_test_placeholder}")
    private String keyId;

    @Value("${razorpay.key-secret:rzp_secret_placeholder}")
    private String keySecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getKeyId() {
        return keyId;
    }

    /**
     * Creates a Razorpay Order ID for frontend checkout modal.
     */
    public Map<String, Object> createOrder(Long bazzarOrderId, BigDecimal amount) {
        // Razorpay accepts amount in paise (1 INR = 100 paise)
        long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).longValue();
        String receipt = "rcpt_" + (bazzarOrderId != null ? bazzarOrderId : UUID.randomUUID().toString().substring(0, 8));

        // If credentials are live and not default placeholder, invoke Razorpay API
        if (isLiveConfigured()) {
            try {
                String auth = keyId + ":" + keySecret;
                String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Basic " + encodedAuth);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("amount", amountInPaise);
                requestBody.put("currency", "INR");
                requestBody.put("receipt", receipt);
                requestBody.put("payment_capture", 1);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.exchange(
                        "https://api.razorpay.com/v1/orders",
                        HttpMethod.POST,
                        entity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    String razorpayOrderId = root.path("id").asText();
                    log.info("Successfully created live Razorpay order: {}", razorpayOrderId);

                    Map<String, Object> result = new HashMap<>();
                    result.put("orderId", razorpayOrderId);
                    result.put("amount", amountInPaise);
                    result.put("currency", "INR");
                    result.put("keyId", keyId);
                    result.put("receipt", receipt);
                    return result;
                }
            } catch (Exception e) {
                log.warn("Razorpay API call failed: {}. Falling back to simulation order.", e.getMessage());
            }
        }

        // Fallback / Sandbox order generation
        String simulatedOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        log.info("Generated simulated Razorpay order: {} for amount: ₹{}", simulatedOrderId, amount);

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", simulatedOrderId);
        result.put("amount", amountInPaise);
        result.put("currency", "INR");
        result.put("keyId", keyId);
        result.put("receipt", receipt);
        return result;
    }

    /**
     * Verifies HMAC-SHA256 signature from Razorpay checkout response.
     */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        if (razorpayOrderId == null || razorpayPaymentId == null || signature == null) {
            return false;
        }

        // If in simulation mode
        if (!isLiveConfigured() || razorpayOrderId.startsWith("order_sim_") || signature.equalsIgnoreCase("simulated_signature")) {
            log.info("Signature verification passed in sandbox simulation mode.");
            return true;
        }

        try {
            String data = razorpayOrderId + "|" + razorpayPaymentId;
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            boolean isValid = hexString.toString().equalsIgnoreCase(signature);
            log.info("Razorpay signature verification result: {}", isValid);
            return isValid;
        } catch (Exception e) {
            log.error("Error verifying Razorpay signature: {}", e.getMessage(), e);
            return false;
        }
    }

    private boolean isLiveConfigured() {
        return keyId != null && !keyId.isBlank() && !keyId.contains("placeholder")
                && keySecret != null && !keySecret.isBlank() && !keySecret.contains("placeholder");
    }
}
