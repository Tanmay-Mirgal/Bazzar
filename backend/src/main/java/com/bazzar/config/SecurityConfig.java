package com.bazzar.config;

import com.bazzar.dto.response.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.time.LocalDateTime;

/**
 * Security configuration using Clerk's JWKS endpoint for JWT validation.
 * All authentication is now handled by Clerk — no local password storage.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${clerk.jwks-url}")
    private String clerkJwksUrl;

    private final com.bazzar.repository.UserRepository userRepository;

    public SecurityConfig(com.bazzar.repository.UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                // Webhooks — verified internally by Svix signature
                .requestMatchers(HttpMethod.POST, "/api/webhooks/clerk").permitAll()
                // Health
                .requestMatchers("/api/health/**").permitAll()
                // Public product browsing
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                // Seller applications can be submitted and viewed by any authenticated user
                .requestMatchers("/api/store-admin/apply", "/api/store-admin/application/**").authenticated()
                // Store admin routes
                .requestMatchers("/api/store-admin/**").hasAnyAuthority("ROLE_STORE_ADMIN", "ROLE_SUPER_ADMIN")
                // Super admin routes
                .requestMatchers("/api/super-admin/**").hasAuthority("ROLE_SUPER_ADMIN")
                // Orders: placing and viewing orders requires authentication
                .requestMatchers("/api/orders/**").authenticated()
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    ObjectMapper mapper = new ObjectMapper();
                    mapper.registerModule(new JavaTimeModule());
                    ErrorResponse errorResponse = ErrorResponse.builder()
                            .timestamp(LocalDateTime.now())
                            .status(401)
                            .error("Unauthorized")
                            .message("Authentication required. Please provide a valid Clerk token.")
                            .path(request.getRequestURI())
                            .build();
                    mapper.writeValue(response.getOutputStream(), errorResponse);
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    ObjectMapper mapper = new ObjectMapper();
                    mapper.registerModule(new JavaTimeModule());
                    ErrorResponse errorResponse = ErrorResponse.builder()
                            .timestamp(LocalDateTime.now())
                            .status(403)
                            .error("Forbidden")
                            .message("Access denied. Insufficient permissions.")
                            .path(request.getRequestURI())
                            .build();
                    mapper.writeValue(response.getOutputStream(), errorResponse);
                })
            );

        return http.build();
    }

    /**
     * Decodes and validates Clerk JWTs using Clerk's public JWKS endpoint.
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(clerkJwksUrl).build();
    }

    /**
     * Converts JWT claims to Spring Security authorities.
     * Reads the "role" claim from Clerk's publicMetadata and maps it to Spring authorities.
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("org_role");
        authoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();

            String clerkId = jwt.getSubject();
            String email = jwt.getClaimAsString("email");
            if (email == null) email = jwt.getClaimAsString("primary_email_address");

            // Direct check for designated super admin Clerk ID or emails
            if ("user_3JDKzXcKBVQFUj6gNNhMCSALD5f".equals(clerkId)
                    || (email != null && (email.equalsIgnoreCase("tanmaymirgal26@gmail.com")
                    || email.equalsIgnoreCase("admin@bazzar.com")))) {
                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
                return authorities;
            }

            // Direct check for designated store admin Clerk ID or emails
            if ("user_3JDSn7kmk8Mt53DZRDbtrgL28MW".equals(clerkId)
                    || (email != null && email.equalsIgnoreCase("tanmaymirgal0026@gmail.com"))) {
                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_STORE_ADMIN"));
                return authorities;
            }

            if (clerkId != null) {
                // 1. Look up user directly in local DB — DB is the source of truth
                java.util.Optional<com.bazzar.entity.User> dbUser = userRepository.findByClerkId(clerkId);
                if (dbUser.isPresent()) {
                    com.bazzar.entity.User u = dbUser.get();
                    if (u.getEmail() != null && (u.getEmail().equalsIgnoreCase("tanmaymirgal26@gmail.com")
                            || u.getEmail().equalsIgnoreCase("admin@bazzar.com"))) {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
                        return authorities;
                    }
                    if (u.getRole() != null) {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(u.getRole().name()));
                        return authorities;
                    }
                }
            }

            // 2. Fallback: Read role from Clerk's public_metadata claim if present
            Object metadataObj = jwt.getClaim("public_metadata");
            if (metadataObj instanceof java.util.Map<?, ?> metadata) {
                Object roleObj = metadata.get("role");
                if (roleObj != null) {
                    String role = roleObj.toString();
                    String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(authority));
                    return authorities;
                }
            }

            // 3. Default: ROLE_USER
            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"));
            return authorities;
        });

        return converter;
    }
}
