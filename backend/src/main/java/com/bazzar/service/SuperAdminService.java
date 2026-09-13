package com.bazzar.service;

import com.bazzar.dto.response.*;
import com.bazzar.entity.*;
import com.bazzar.exception.BadRequestException;
import com.bazzar.exception.ResourceNotFoundException;
import com.bazzar.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SuperAdminService {

    private final StoreAdminApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final StoreAdminService storeAdminService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    public SuperAdminService(StoreAdminApplicationRepository applicationRepository,
                              UserRepository userRepository,
                              StoreRepository storeRepository,
                              ProductRepository productRepository,
                              StoreAdminService storeAdminService,
                              OrderService orderService,
                              OrderRepository orderRepository,
                              EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.storeAdminService = storeAdminService;
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    // ── APPLICATIONS ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StoreAdminApplicationResponse> getAllApplications() {
        return applicationRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toApplicationResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<StoreAdminApplicationResponse> getApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.findByStatus(status)
                .stream().map(this::toApplicationResponse).toList();
    }

    @Transactional
    public StoreAdminApplicationResponse approveApplication(Long applicationId, String note) {
        StoreAdminApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        // Update application status
        application.setStatus(ApplicationStatus.APPROVED);
        application.setSuperAdminNote(note);
        application.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(application);

        // Promote user to STORE_ADMIN
        User user = application.getUser();
        user.setRole(Role.ROLE_STORE_ADMIN);
        userRepository.save(user);

        // Create store for this admin (if not already exists)
        if (!storeRepository.existsByUserId(user.getId())) {
            Store store = Store.builder()
                    .user(user)
                    .storeName(application.getBusinessName())
                    .storeDescription(application.getBusinessDescription())
                    .isActive(true)
                    .build();
            storeRepository.save(store);
        }

        emailService.sendApplicationApprovedEmail(user, application);
        return toApplicationResponse(application);
    }

    @Transactional
    public StoreAdminApplicationResponse rejectApplication(Long applicationId, String note) {
        if (note == null || note.trim().isEmpty()) {
            throw new BadRequestException("Rejection remark is required. Please explain what needs to be changed before re-submitting.");
        }

        StoreAdminApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        application.setStatus(ApplicationStatus.REJECTED);
        application.setSuperAdminNote(note.trim());
        application.setReviewedAt(LocalDateTime.now());
        applicationRepository.save(application);

        emailService.sendApplicationRejectedEmail(application.getUser(), application, note.trim());
        return toApplicationResponse(application);
    }

    // ── PRODUCTS ─────────────────────────────────────────────────────────────
 
    @Transactional(readOnly = true)
    public List<ProductResponse> getPendingProducts() {
        return productRepository.findByStatusOrderByCreatedAtAsc(ProductStatus.PENDING)
                .stream().map(storeAdminService::toProductResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        java.util.Map<Long, Store> storeMap = new java.util.HashMap<>();
        for (Store s : storeRepository.findAll()) {
            if (s.getUser() != null) {
                storeMap.put(s.getUser().getId(), s);
            }
        }
        java.util.Map<Long, StoreAdminApplication> appMap = new java.util.HashMap<>();
        for (StoreAdminApplication a : applicationRepository.findAll()) {
            if (a.getUser() != null) {
                appMap.put(a.getUser().getId(), a);
            }
        }
        return products.stream()
                .map(p -> storeAdminService.toProductResponse(p, storeMap, appMap))
                .toList();
    }

    @Transactional
    public ProductResponse approveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        product.setStatus(ProductStatus.APPROVED);
        product.setRejectionReason(null);
        product.setReviewedAt(LocalDateTime.now());
        Product saved = productRepository.save(product);

        if (saved.getStoreAdmin() != null) {
            emailService.sendProductApprovedEmail(saved.getStoreAdmin(), saved);
        }

        return storeAdminService.toProductResponse(saved);
    }

    @Transactional
    public ProductResponse rejectProduct(Long productId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is required. Please explain why this product is rejected so the seller can update it.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        product.setStatus(ProductStatus.REJECTED);
        product.setRejectionReason(reason.trim());
        product.setReviewedAt(LocalDateTime.now());
        Product saved = productRepository.save(product);

        if (saved.getStoreAdmin() != null) {
            emailService.sendProductRejectedEmail(saved.getStoreAdmin(), saved, reason.trim());
        }

        return storeAdminService.toProductResponse(saved);
    }

    // ── USERS ────────────────────────────────────────────────────────────────

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream().map(this::toUserResponse).toList();
    }

    // ── STORES ───────────────────────────────────────────────────────────────

    public List<StoreResponse> getAllStores() {
        return storeRepository.findAll()
                .stream().map(this::toStoreResponse).toList();
    }

    @Transactional
    public StoreResponse toggleStoreActive(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + storeId));
        store.setIsActive(!store.getIsActive());
        return toStoreResponse(storeRepository.save(store));
    }

    // ── ORDERS ───────────────────────────────────────────────────────────────

    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        return orderService.updateOrderStatus(orderId, status);
    }

    // ── DASHBOARD STATS ──────────────────────────────────────────────────────

    public DashboardStatsResponse getPlatformStats() {
        return DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalStores(storeRepository.count())
                .totalProducts(productRepository.count())
                .totalOrders(orderRepository.count())
                .pendingApplications(applicationRepository.countByStatus(ApplicationStatus.PENDING))
                .pendingProducts(productRepository.countByStatus(ProductStatus.PENDING))
                .approvedProducts(productRepository.countByStatus(ProductStatus.APPROVED))
                .rejectedProducts(productRepository.countByStatus(ProductStatus.REJECTED))
                .build();
    }

    // ── MAPPERS ──────────────────────────────────────────────────────────────

    private StoreAdminApplicationResponse toApplicationResponse(StoreAdminApplication app) {
        return StoreAdminApplicationResponse.builder()
                .id(app.getId())
                .userId(app.getUser().getId())
                .userName(app.getUser().getName())
                .userEmail(app.getUser().getEmail())
                .businessName(app.getBusinessName())
                .businessType(app.getBusinessType())
                .businessRegistrationType(app.getBusinessRegistrationType())
                .businessDescription(app.getBusinessDescription())
                .contactPhone(app.getContactPhone())
                .gstNumber(app.getGstNumber())
                .panNumber(app.getPanNumber())
                .websiteUrl(app.getWebsiteUrl())
                // Pickup Logistics
                .pickupContactName(app.getPickupContactName())
                .pickupContactPhone(app.getPickupContactPhone())
                .pickupAddressLine1(app.getPickupAddressLine1())
                .pickupAddressLine2(app.getPickupAddressLine2())
                .pickupCity(app.getPickupCity())
                .pickupState(app.getPickupState())
                .pickupPostalCode(app.getPickupPostalCode())
                .pickupLandmark(app.getPickupLandmark())
                // Bank Payout
                .bankAccountHolderName(app.getBankAccountHolderName())
                .bankName(app.getBankName())
                .bankAccountNumber(app.getBankAccountNumber())
                .bankIfscCode(app.getBankIfscCode())
                .status(app.getStatus())
                .superAdminNote(app.getSuperAdminNote())
                .createdAt(app.getCreatedAt())
                .reviewedAt(app.getReviewedAt())
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "ROLE_USER")
                .build();
    }

    private StoreResponse toStoreResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .userId(store.getUser().getId())
                .ownerName(store.getUser().getName())
                .ownerEmail(store.getUser().getEmail())
                .storeName(store.getStoreName())
                .storeDescription(store.getStoreDescription())
                .logoUrl(store.getLogoUrl())
                .isActive(store.getIsActive())
                .createdAt(store.getCreatedAt())
                .totalProducts(productRepository.countByStoreAdminId(store.getUser().getId()))
                .build();
    }
}
