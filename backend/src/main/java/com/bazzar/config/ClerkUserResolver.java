package com.bazzar.config;

import com.bazzar.entity.Cart;
import com.bazzar.entity.Role;
import com.bazzar.entity.User;
import com.bazzar.repository.CartRepository;
import com.bazzar.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Helper that resolves a Clerk JWT to a local User entity.
 * The JWT's "sub" claim contains the Clerk user ID (e.g. "user_2abc123...").
 * Includes seamless fallback JIT provisioning for local development or webhook delays.
 */
@Component
public class ClerkUserResolver {

    private static final Logger log = LoggerFactory.getLogger(ClerkUserResolver.class);

    private final UserRepository userRepository;
    private final CartRepository cartRepository;

    public ClerkUserResolver(UserRepository userRepository, CartRepository cartRepository) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
    }

    /**
     * Loads the local User entity for the authenticated Clerk user.
     * If the user doesn't exist yet (e.g. webhook delayed or local dev without webhook tunnel),
     * performs safe Just-In-Time provisioning so the user is immediately usable.
     */
    @Transactional
    public User resolve(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            return null;
        }
        String clerkId = jwt.getSubject();
        User user = userRepository.findByClerkId(clerkId)
                .orElseGet(() -> provisionUser(jwt));

        // Auto-promote designated super admin emails
        String email = user.getEmail();
        if (email != null && (
                email.equalsIgnoreCase("tanmaymirgal26@gmail.com") ||
                email.equalsIgnoreCase("admin@bazzar.com")
        )) {
            if (user.getRole() != Role.ROLE_SUPER_ADMIN) {
                user.setRole(Role.ROLE_SUPER_ADMIN);
                user = userRepository.save(user);
                log.info("Auto-promoted user {} to ROLE_SUPER_ADMIN", email);
            }
        }
        return user;
    }

    /**
     * Loads the local User entity, throwing an exception if not found or cannot be resolved.
     */
    @Transactional
    public User resolveOrThrow(Jwt jwt) {
        User user = resolve(jwt);
        if (user == null) {
            throw new com.bazzar.exception.ResourceNotFoundException("User could not be authenticated from token");
        }
        return user;
    }

    @Transactional
    public User provisionUser(Jwt jwt) {
        String clerkId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        if (email == null) email = jwt.getClaimAsString("primary_email_address");
        if (email == null) email = clerkId + "@clerk.user";

        // Check if user already exists by email (e.g. seed super admin admin@bazzar.com)
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User u = existing.get();
            u.setClerkId(clerkId);
            log.info("Linked existing user {} with clerkId {}", email, clerkId);
            return userRepository.save(u);
        }

        String name = jwt.getClaimAsString("name");
        if (name == null || name.isBlank()) name = "User";

        // All newly created users always start as normal ROLE_USER.
        Role role = Role.ROLE_USER;

        User newUser = User.builder()
                .clerkId(clerkId)
                .email(email)
                .name(name)
                .role(role)
                .isActive(true)
                .build();
        newUser = userRepository.save(newUser);

        if (!cartRepository.existsByUserId(newUser.getId())) {
            cartRepository.save(Cart.builder().user(newUser).build());
        }

        log.info("JIT provisioned user in DB: clerkId={}, email={}, role={}", clerkId, email, role);
        return newUser;
    }
}
