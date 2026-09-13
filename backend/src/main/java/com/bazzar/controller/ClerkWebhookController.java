package com.bazzar.controller;

import com.bazzar.entity.Cart;
import com.bazzar.entity.Role;
import com.bazzar.entity.User;
import com.bazzar.repository.CartRepository;
import com.bazzar.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.svix.Webhook;
import com.svix.exceptions.WebhookVerificationException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Handles Clerk webhook events to keep the local database in sync with Clerk's user store.
 *
 * Events handled:
 * - user.created → creates a new User in DB
 * - user.updated → updates name/email in DB
 * - user.deleted → soft-deletes (marks inactive) the User in DB
 *
 * Webhook signature verification uses Svix (Clerk's delivery provider).
 * The endpoint is permitAll in SecurityConfig — auth happens via Svix signature check here.
 */
@RestController
@RequestMapping("/api/webhooks")
public class ClerkWebhookController {

    private static final Logger log = LoggerFactory.getLogger(ClerkWebhookController.class);

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ObjectMapper objectMapper;

    @Value("${clerk.webhook-secret}")
    private String webhookSecret;

    public ClerkWebhookController(UserRepository userRepository,
                                   CartRepository cartRepository,
                                   ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/clerk")
    @Transactional
    public ResponseEntity<Map<String, String>> handleClerkWebhook(
            @RequestBody byte[] rawBody,
            HttpServletRequest request) {

        // ── 1. Verify Svix signature ─────────────────────────────────────────
        try {
            Webhook wh = new Webhook(webhookSecret);
            Map<String, java.util.List<String>> headerMap = new HashMap<>();
            for (String headerName : java.util.Collections.list(request.getHeaderNames())) {
                headerMap.put(headerName.toLowerCase(),
                        java.util.Collections.list(request.getHeaders(headerName)));
            }
            java.net.http.HttpHeaders headers = java.net.http.HttpHeaders.of(headerMap, (k, v) -> true);
            String payloadString = new String(rawBody, java.nio.charset.StandardCharsets.UTF_8);
            wh.verify(payloadString, headers);
        } catch (WebhookVerificationException e) {
            log.warn("Clerk webhook verification failed: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", "Invalid webhook signature"));
        }

        // ── 2. Parse payload ─────────────────────────────────────────────────
        try {
            JsonNode payload = objectMapper.readTree(rawBody);
            String eventType = payload.get("type").asText();
            JsonNode data = payload.get("data");

            log.info("Received Clerk webhook event: {}", eventType);

            switch (eventType) {
                case "user.created" -> handleUserCreated(data);
                case "user.updated" -> handleUserUpdated(data);
                case "user.deleted" -> handleUserDeleted(data);
                default -> log.debug("Unhandled Clerk event type: {}", eventType);
            }

            return ResponseEntity.ok(Map.of("status", "processed"));

        } catch (Exception e) {
            log.error("Error processing Clerk webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal processing error"));
        }
    }

    private void handleUserCreated(JsonNode data) {
        String clerkId = data.get("id").asText();

        if (userRepository.existsByClerkId(clerkId)) {
            log.info("User already exists for clerkId: {}", clerkId);
            return;
        }

        String email = extractPrimaryEmail(data);
        String name = extractFullName(data);

        // If user already exists by email (e.g. seeded admin), link their clerkId
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User existing = existingUser.get();
            existing.setClerkId(clerkId);
            if (name != null && !name.isBlank()) {
                existing.setName(name);
            }
            userRepository.save(existing);
            log.info("Linked existing user by email {} with clerkId {}", email, clerkId);
            return;
        }

        // All newly created users always start as normal ROLE_USER.
        // Role upgrades happen via seller application approval or direct DB assignment for super admin.
        Role role = Role.ROLE_USER;

        User user = User.builder()
                .clerkId(clerkId)
                .name(name)
                .email(email)
                .role(role)
                .isActive(true)
                .build();
        user = userRepository.save(user);
        log.info("Created user in DB from Clerk webhook: clerkId={}, email={}", clerkId, email);

        // Create empty cart for the new user
        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);
    }

    private void handleUserUpdated(JsonNode data) {
        String clerkId = data.get("id").asText();
        userRepository.findByClerkId(clerkId).ifPresent(user -> {
            String email = extractPrimaryEmail(data);
            String name = extractFullName(data);

            user.setEmail(email);
            user.setName(name);
            userRepository.save(user);
            log.info("Updated user in DB from Clerk webhook: clerkId={}", clerkId);
        });
    }

    private void handleUserDeleted(JsonNode data) {
        String clerkId = data.get("id").asText();
        userRepository.findByClerkId(clerkId).ifPresent(user -> {
            user.setIsActive(false);
            userRepository.save(user);
            log.info("Soft-deleted user in DB from Clerk webhook: clerkId={}", clerkId);
        });
    }

    private String extractPrimaryEmail(JsonNode data) {
        JsonNode emailAddresses = data.get("email_addresses");
        String primaryEmailId = data.has("primary_email_address_id")
                ? data.get("primary_email_address_id").asText() : null;

        if (emailAddresses != null && emailAddresses.isArray()) {
            for (JsonNode emailNode : emailAddresses) {
                if (primaryEmailId != null &&
                        primaryEmailId.equals(emailNode.get("id").asText())) {
                    return emailNode.get("email_address").asText();
                }
            }
            // Fallback: first email
            if (emailAddresses.size() > 0) {
                return emailAddresses.get(0).get("email_address").asText();
            }
        }
        return "unknown@bazzar.com";
    }

    private String extractFullName(JsonNode data) {
        String firstName = data.has("first_name") && !data.get("first_name").isNull()
                ? data.get("first_name").asText("") : "";
        String lastName = data.has("last_name") && !data.get("last_name").isNull()
                ? data.get("last_name").asText("") : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? "Bazzar User" : fullName;
    }
}
