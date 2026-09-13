package com.bazzar.controller;

import com.bazzar.config.ClerkUserResolver;
import com.bazzar.dto.response.UserResponse;
import com.bazzar.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * Auth endpoints — registration and login are now handled by Clerk's hosted UI.
 * This controller only exposes /api/auth/me to get the current user's profile from the DB.
 *
 * The legacy /register and /login endpoints are removed.
 * User creation is triggered by Clerk webhooks (user.created event).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final ClerkUserResolver clerkUserResolver;

    public AuthController(ClerkUserResolver clerkUserResolver) {
        this.clerkUserResolver = clerkUserResolver;
    }

    /**
     * Returns the current user's profile from the local DB.
     * The Clerk JWT must be present in the Authorization header.
     * The user must have been created in the DB via the Clerk webhook first.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }

        User user = clerkUserResolver.resolve(jwt);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        String roleName = user.getRole() != null ? user.getRole().name() : "ROLE_USER";
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(roleName)
                .build();

        return ResponseEntity.ok(userResponse);
    }
}
