package com.bazzar.service;

import com.bazzar.dto.request.LoginRequest;
import com.bazzar.dto.request.RegisterRequest;
import com.bazzar.dto.response.AuthResponse;
import com.bazzar.dto.response.UserResponse;
import com.bazzar.entity.Cart;
import com.bazzar.entity.User;
import com.bazzar.exception.BadRequestException;
import com.bazzar.repository.CartRepository;
import com.bazzar.repository.UserRepository;
import com.bazzar.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       CartRepository cartRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.bazzar.entity.Role.ROLE_USER)
                .build();
        user = userRepository.save(user);

        // Create an empty cart for the new user
        Cart cart = Cart.builder()
                .user(user)
                .build();
        cartRepository.save(cart);

        String token = generateToken(user);
        return buildAuthResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = generateToken(user);
        return buildAuthResponse(token, user);
    }

    private String generateToken(User user) {
        String roleName = user.getRole() != null ? user.getRole().name() : "ROLE_USER";
        org.springframework.security.core.userdetails.UserDetails userDetails =
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .authorities(Collections.singletonList(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(roleName)
                        ))
                        .build();
        return jwtService.generateToken(userDetails);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        String roleName = user.getRole() != null ? user.getRole().name() : "ROLE_USER";
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(roleName)
                .build();
        return AuthResponse.builder()
                .token(token)
                .user(userResponse)
                .build();
    }
}
