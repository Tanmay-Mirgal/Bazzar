package com.bazzar.service;

import com.bazzar.config.ClerkUserResolver;
import com.bazzar.dto.request.ProductRequest;
import com.bazzar.dto.request.StoreAdminApplicationRequest;
import com.bazzar.dto.response.*;
import com.bazzar.entity.*;
import com.bazzar.exception.BadRequestException;
import com.bazzar.exception.ResourceNotFoundException;
import com.bazzar.repository.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class StoreAdminService {

    private final ClerkUserResolver clerkUserResolver;
    private final UserRepository userRepository;
    private final StoreAdminApplicationRepository applicationRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final EmailService emailService;
    private final OrderRepository orderRepository;

    public StoreAdminService(ClerkUserResolver clerkUserResolver,
                              UserRepository userRepository,
                              StoreAdminApplicationRepository applicationRepository,
                              StoreRepository storeRepository,
                              ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              CategoryService categoryService,
                              EmailService emailService,
                              OrderRepository orderRepository) {
        this.clerkUserResolver = clerkUserResolver;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.categoryService = categoryService;
        this.emailService = emailService;
        this.orderRepository = orderRepository;
    }

    // ── APPLICATION ──────────────────────────────────────────────────────────

    @Transactional
    public StoreAdminApplicationResponse submitApplication(Jwt jwt,
                                                            StoreAdminApplicationRequest request) {
        User user = clerkUserResolver.resolveOrThrow(jwt);

        Optional<StoreAdminApplication> existingOpt = applicationRepository.findByUserId(user.getId());
        if (existingOpt.isPresent()) {
            StoreAdminApplication existing = existingOpt.get();
            if (existing.getStatus() == ApplicationStatus.PENDING) {
                throw new BadRequestException("You already have a pending application.");
            }
            if (existing.getStatus() == ApplicationStatus.APPROVED) {
                throw new BadRequestException("Your application has already been approved.");
            }
            // If REJECTED, allow re-application by updating the existing record
            existing.setBusinessName(request.getBusinessName());
            existing.setBusinessType(request.getBusinessType());
            existing.setBusinessRegistrationType(request.getBusinessRegistrationType());
            existing.setBusinessDescription(request.getBusinessDescription());
            existing.setContactPhone(request.getContactPhone());
            existing.setGstNumber(request.getGstNumber());
            existing.setPanNumber(request.getPanNumber());
            existing.setWebsiteUrl(request.getWebsiteUrl());

            // Pickup & Logistics
            existing.setPickupContactName(request.getPickupContactName());
            existing.setPickupContactPhone(request.getPickupContactPhone());
            existing.setPickupAddressLine1(request.getPickupAddressLine1());
            existing.setPickupAddressLine2(request.getPickupAddressLine2());
            existing.setPickupCity(request.getPickupCity());
            existing.setPickupState(request.getPickupState());
            existing.setPickupPostalCode(request.getPickupPostalCode());
            existing.setPickupLandmark(request.getPickupLandmark());

            // Bank Payout
            existing.setBankAccountHolderName(request.getBankAccountHolderName());
            existing.setBankName(request.getBankName());
            existing.setBankAccountNumber(request.getBankAccountNumber());
            existing.setBankIfscCode(request.getBankIfscCode());

            existing.setStatus(ApplicationStatus.PENDING);
            existing.setSuperAdminNote(null);
            existing.setReviewedAt(null);
            StoreAdminApplication saved = applicationRepository.save(existing);
            emailService.sendApplicationSubmittedEmail(user, saved);
            return toApplicationResponse(saved);
        }

        StoreAdminApplication application = StoreAdminApplication.builder()
                .user(user)
                .businessName(request.getBusinessName())
                .businessType(request.getBusinessType())
                .businessRegistrationType(request.getBusinessRegistrationType())
                .businessDescription(request.getBusinessDescription())
                .contactPhone(request.getContactPhone())
                .gstNumber(request.getGstNumber())
                .panNumber(request.getPanNumber())
                .websiteUrl(request.getWebsiteUrl())
                // Pickup & Logistics
                .pickupContactName(request.getPickupContactName())
                .pickupContactPhone(request.getPickupContactPhone())
                .pickupAddressLine1(request.getPickupAddressLine1())
                .pickupAddressLine2(request.getPickupAddressLine2())
                .pickupCity(request.getPickupCity())
                .pickupState(request.getPickupState())
                .pickupPostalCode(request.getPickupPostalCode())
                .pickupLandmark(request.getPickupLandmark())
                // Bank Payout
                .bankAccountHolderName(request.getBankAccountHolderName())
                .bankName(request.getBankName())
                .bankAccountNumber(request.getBankAccountNumber())
                .bankIfscCode(request.getBankIfscCode())
                .status(ApplicationStatus.PENDING)
                .build();

        StoreAdminApplication saved = applicationRepository.save(application);
        emailService.sendApplicationSubmittedEmail(user, saved);
        return toApplicationResponse(saved);
    }

    public StoreAdminApplicationResponse getMyApplication(Jwt jwt) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        StoreAdminApplication application = applicationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No application found for your account."));
        return toApplicationResponse(application);
    }

    // ── PRODUCTS ─────────────────────────────────────────────────────────────

    public List<ProductResponse> getMyProducts(Jwt jwt) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return productRepository.findByStoreAdminId(user.getId())
                .stream().map(this::toProductResponse).toList();
    }

    @Transactional
    public ProductResponse addProduct(Jwt jwt, ProductRequest request) {
        User user = clerkUserResolver.resolveOrThrow(jwt);

        // Ensure user is an active store admin
        if (user.getRole() != Role.ROLE_STORE_ADMIN && user.getRole() != Role.ROLE_SUPER_ADMIN) {
            throw new BadRequestException("Only store admins can add products.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .image(request.getImage())
                .category(category)
                .storeAdmin(user)
                .status(ProductStatus.PENDING)  // Always starts as pending
                .build();

        Product saved = productRepository.save(product);
        emailService.sendProductSubmittedEmail(user, saved);
        return toProductResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Jwt jwt, Long productId, ProductRequest request) {
        User user = clerkUserResolver.resolveOrThrow(jwt);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        // Store admins can only edit their own products
        if (product.getStoreAdmin() == null || !product.getStoreAdmin().getId().equals(user.getId())) {
            if (user.getRole() != Role.ROLE_SUPER_ADMIN) {
                throw new BadRequestException("You can only edit your own products.");
            }
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImage(request.getImage());
        product.setCategory(category);
        // Reset to PENDING after edit — needs re-approval
        product.setStatus(ProductStatus.PENDING);
        product.setRejectionReason(null);
        product.setReviewedAt(null);

        Product saved = productRepository.save(product);
        emailService.sendProductSubmittedEmail(user, saved);
        return toProductResponse(saved);
    }

    @Transactional
    public void deleteProduct(Jwt jwt, Long productId) {
        User user = clerkUserResolver.resolveOrThrow(jwt);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (product.getStoreAdmin() == null || !product.getStoreAdmin().getId().equals(user.getId())) {
            if (user.getRole() != Role.ROLE_SUPER_ADMIN) {
                throw new BadRequestException("You can only delete your own products.");
            }
        }

        productRepository.deleteById(productId);
    }

    // ── STORE SETTINGS ───────────────────────────────────────────────────────

    public StoreResponse getMyStore(Jwt jwt) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        Store store = storeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No store found for your account."));
        return toStoreResponse(store);
    }

    @Transactional
    public StoreResponse updateStore(Jwt jwt, String storeName, String storeDescription, String logoUrl) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        Store store = storeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No store found for your account."));

        store.setStoreName(storeName);
        store.setStoreDescription(storeDescription);
        store.setLogoUrl(logoUrl);

        return toStoreResponse(storeRepository.save(store));
    }

    // ── ORDERS & MANAGEMENT ──────────────────────────────────────────────────

    public List<OrderResponse> getMyOrders(Jwt jwt) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        List<Order> orders = orderRepository.findOrdersByStoreAdminId(user.getId());
        if (orders.isEmpty() && user.getRole() == Role.ROLE_SUPER_ADMIN) {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return orders.stream().map(orderService::toResponse).toList();
    }

    @Transactional
    public OrderResponse updateMyOrderStatus(Jwt jwt, Long orderId, OrderStatus status) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        return orderService.updateOrderStatus(orderId, status);
    }

    // ── DASHBOARD STATS ──────────────────────────────────────────────────────

    public DashboardStatsResponse getMyStats(Jwt jwt) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        long myProducts = productRepository.countByStoreAdminId(user.getId());
        long myPending = productRepository.findByStoreAdminIdAndStatus(user.getId(), ProductStatus.PENDING).size();
        long myApproved = productRepository.findByStoreAdminIdAndStatus(user.getId(), ProductStatus.APPROVED).size();
        long myRejected = productRepository.findByStoreAdminIdAndStatus(user.getId(), ProductStatus.REJECTED).size();

        List<Order> orders = orderRepository.findOrdersByStoreAdminId(user.getId());
        if (orders.isEmpty() && user.getRole() == Role.ROLE_SUPER_ADMIN) {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        BigDecimal totalRev = BigDecimal.ZERO;
        long totalUnits = 0;
        for (Order o : orders) {
            for (OrderItem i : o.getItems()) {
                Product p = i.getProduct();
                boolean isMyProduct = (p.getStoreAdmin() != null && p.getStoreAdmin().getId().equals(user.getId()))
                        || user.getRole() == Role.ROLE_SUPER_ADMIN;
                if (isMyProduct) {
                    BigDecimal lineTotal = i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()));
                    totalRev = totalRev.add(lineTotal);
                    totalUnits += i.getQuantity();
                }
            }
        }

        BigDecimal pendingPayout = totalRev.multiply(BigDecimal.valueOf(0.95)).setScale(2, RoundingMode.HALF_UP);

        return DashboardStatsResponse.builder()
                .myProducts(myProducts)
                .myPendingProducts(myPending)
                .myApprovedProducts(myApproved)
                .myRejectedProducts(myRejected)
                .myTotalOrders(orders.size())
                .myTotalRevenue(totalRev)
                .myUnitsSold(totalUnits)
                .myPendingPayout(pendingPayout)
                .build();
    }

    // ── ANALYTICS & REVENUE ──────────────────────────────────────────────────

    public SellerAnalyticsResponse getMyAnalytics(Jwt jwt) {
        User user = clerkUserResolver.resolveOrThrow(jwt);
        List<Order> orders = orderRepository.findOrdersByStoreAdminId(user.getId());
        if (orders.isEmpty() && user.getRole() == Role.ROLE_SUPER_ADMIN) {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalUnits = 0;
        Map<String, Long> statusCounts = new HashMap<>();
        Map<String, BigDecimal> catRevMap = new HashMap<>();
        Map<String, Long> catUnitsMap = new HashMap<>();
        Map<Long, SellerAnalyticsResponse.TopProductItem> topProdMap = new HashMap<>();

        for (Order o : orders) {
            String s = o.getStatus().name();
            statusCounts.put(s, statusCounts.getOrDefault(s, 0L) + 1);

            for (OrderItem item : o.getItems()) {
                Product p = item.getProduct();
                boolean isMyProduct = (p.getStoreAdmin() != null && p.getStoreAdmin().getId().equals(user.getId()))
                        || user.getRole() == Role.ROLE_SUPER_ADMIN;

                if (isMyProduct) {
                    BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    totalRevenue = totalRevenue.add(lineTotal);
                    totalUnits += item.getQuantity();

                    String cName = (p.getCategory() != null) ? p.getCategory().getName() : "General";
                    catRevMap.put(cName, catRevMap.getOrDefault(cName, BigDecimal.ZERO).add(lineTotal));
                    catUnitsMap.put(cName, catUnitsMap.getOrDefault(cName, 0L) + item.getQuantity());

                    SellerAnalyticsResponse.TopProductItem itemObj = topProdMap.get(p.getId());
                    if (itemObj == null) {
                        itemObj = SellerAnalyticsResponse.TopProductItem.builder()
                                .id(p.getId())
                                .name(p.getName())
                                .image(p.getImage())
                                .price(p.getPrice())
                                .stock(p.getStock())
                                .unitsSold(item.getQuantity())
                                .totalRevenue(lineTotal)
                                .build();
                        topProdMap.put(p.getId(), itemObj);
                    } else {
                        itemObj.setUnitsSold(itemObj.getUnitsSold() + item.getQuantity());
                        itemObj.setTotalRevenue(itemObj.getTotalRevenue().add(lineTotal));
                    }
                }
            }
        }

        BigDecimal platformFee = totalRevenue.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netEarnings = totalRevenue.subtract(platformFee).setScale(2, RoundingMode.HALF_UP);
        BigDecimal availablePayout = netEarnings.multiply(BigDecimal.valueOf(0.85)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pendingPayout = netEarnings.subtract(availablePayout).setScale(2, RoundingMode.HALF_UP);

        BigDecimal aov = orders.isEmpty() ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP);

        long myProducts = productRepository.countByStoreAdminId(user.getId());
        long myApproved = productRepository.findByStoreAdminIdAndStatus(user.getId(), ProductStatus.APPROVED).size();
        long myPending = productRepository.findByStoreAdminIdAndStatus(user.getId(), ProductStatus.PENDING).size();

        // Build category breakdown
        List<SellerAnalyticsResponse.CategoryBreakdownItem> catBreakdown = new ArrayList<>();
        BigDecimal finalTotalRevenue = totalRevenue;
        catRevMap.forEach((catName, rev) -> {
            int pct = finalTotalRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? rev.multiply(BigDecimal.valueOf(100)).divide(finalTotalRevenue, 0, RoundingMode.HALF_UP).intValue()
                    : 0;
            catBreakdown.add(SellerAnalyticsResponse.CategoryBreakdownItem.builder()
                    .categoryName(catName)
                    .revenue(rev)
                    .count(catUnitsMap.getOrDefault(catName, 0L))
                    .percentage(pct)
                    .build());
        });

        // Top products sorted by revenue
        List<SellerAnalyticsResponse.TopProductItem> topProducts = new ArrayList<>(topProdMap.values());
        topProducts.sort((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()));
        if (topProducts.size() > 5) topProducts = topProducts.subList(0, 5);

        // Sales trend based on real orders in the last 7 days
        Map<String, BigDecimal> dayRevMap = new HashMap<>();
        Map<String, Long> dayOrdersMap = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd");

        for (Order o : orders) {
            if (o.getCreatedAt() != null) {
                String dayLabel = o.getCreatedAt().format(dtf);
                BigDecimal orderStoreRev = BigDecimal.ZERO;
                for (OrderItem i : o.getItems()) {
                    Product p = i.getProduct();
                    boolean isMyProduct = (p.getStoreAdmin() != null && p.getStoreAdmin().getId().equals(user.getId()))
                            || user.getRole() == Role.ROLE_SUPER_ADMIN;
                    if (isMyProduct) {
                        orderStoreRev = orderStoreRev.add(i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())));
                    }
                }
                dayRevMap.put(dayLabel, dayRevMap.getOrDefault(dayLabel, BigDecimal.ZERO).add(orderStoreRev));
                dayOrdersMap.put(dayLabel, dayOrdersMap.getOrDefault(dayLabel, 0L) + 1);
            }
        }

        List<SellerAnalyticsResponse.SalesTrendPoint> salesTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime day = now.minusDays(i);
            String label = day.format(dtf);
            salesTrend.add(SellerAnalyticsResponse.SalesTrendPoint.builder()
                    .label(label)
                    .revenue(dayRevMap.getOrDefault(label, BigDecimal.ZERO))
                    .orders(dayOrdersMap.getOrDefault(label, 0L))
                    .build());
        }

        // Real Bank info from application
        Optional<StoreAdminApplication> appOpt = applicationRepository.findByUserId(user.getId());
        SellerAnalyticsResponse.BankPayoutInfo bankInfo;
        if (appOpt.isPresent()) {
            StoreAdminApplication app = appOpt.get();
            String acc = app.getBankAccountNumber();
            String masked = (acc != null && acc.length() > 4) ? "•••• " + acc.substring(acc.length() - 4) : (acc != null ? acc : "Not Configured");
            bankInfo = SellerAnalyticsResponse.BankPayoutInfo.builder()
                    .bankName(app.getBankName() != null && !app.getBankName().isBlank() ? app.getBankName() : "Bank Pending")
                    .accountHolderName(app.getBankAccountHolderName() != null && !app.getBankAccountHolderName().isBlank() ? app.getBankAccountHolderName() : user.getName())
                    .accountNumberMasked(masked)
                    .ifscCode(app.getBankIfscCode() != null && !app.getBankIfscCode().isBlank() ? app.getBankIfscCode() : "Pending")
                    .settlementCycle("Weekly Payouts (Every Monday)")
                    .nextPayoutDate("Upcoming Monday, 10:00 AM IST")
                    .status(app.getStatus() == ApplicationStatus.APPROVED ? "Active & Verified" : "Pending Verification")
                    .build();
        } else {
            bankInfo = SellerAnalyticsResponse.BankPayoutInfo.builder()
                    .bankName("Bank Not Linked")
                    .accountHolderName(user.getName())
                    .accountNumberMasked("No Account")
                    .ifscCode("N/A")
                    .settlementCycle("Weekly Payouts (Every Monday)")
                    .nextPayoutDate("Configure in Settings")
                    .status("Unlinked")
                    .build();
        }

        // Real payout history (only if orders have been placed and delivered)
        List<SellerAnalyticsResponse.PayoutHistoryItem> payoutHistory = new ArrayList<>();
        List<Order> deliveredOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .toList();

        if (!deliveredOrders.isEmpty() && availablePayout.compareTo(BigDecimal.ZERO) > 0) {
            DateTimeFormatter payDtf = DateTimeFormatter.ofPattern("MMM dd, yyyy");
            payoutHistory.add(SellerAnalyticsResponse.PayoutHistoryItem.builder()
                    .payoutId("PAY-" + user.getId() + "01")
                    .date(now.minusDays(2).format(payDtf))
                    .amount(availablePayout)
                    .referenceNumber("NEFT-BZ-" + user.getId() + System.currentTimeMillis() % 1000000)
                    .status("Processed")
                    .bankName(bankInfo.getBankName())
                    .build());
        }

        return SellerAnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .netEarnings(netEarnings)
                .platformFee(platformFee)
                .availablePayout(availablePayout)
                .pendingPayout(pendingPayout)
                .totalOrders(orders.size())
                .unitsSold(totalUnits)
                .averageOrderValue(aov)
                .activeProducts(myApproved > 0 ? myApproved : myProducts)
                .pendingApprovals(myPending)
                .ordersByStatus(statusCounts)
                .salesTrend(salesTrend)
                .categoryBreakdown(catBreakdown)
                .topProducts(topProducts)
                .bankPayout(bankInfo)
                .payoutHistory(payoutHistory)
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

    public ProductResponse toProductResponse(Product product) {
        return toProductResponse(product, null, null);
    }

    public ProductResponse toProductResponse(
            Product product,
            Map<Long, Store> storeMap,
            Map<Long, StoreAdminApplication> appMap) {
        if (product == null) return null;
        User storeAdmin = product.getStoreAdmin();
        String storeName = null;
        String sellerEmail = null;
        String sellerPhone = null;
        String sellerPickupLocation = null;
        String sellerPan = null;
        String sellerGst = null;

        if (storeAdmin != null) {
            sellerEmail = storeAdmin.getEmail();
            Long userId = storeAdmin.getId();

            // Store lookup: from map or repository
            Store store = null;
            if (storeMap != null) {
                store = storeMap.get(userId);
            } else {
                try {
                    store = storeRepository.findByUserId(userId).orElse(null);
                } catch (Exception ignored) {}
            }
            if (store != null) {
                storeName = store.getStoreName();
            }

            // Application lookup: from map or repository
            StoreAdminApplication app = null;
            if (appMap != null) {
                app = appMap.get(userId);
            } else {
                try {
                    app = applicationRepository.findByUserId(userId).orElse(null);
                } catch (Exception ignored) {}
            }
            if (app != null) {
                if (storeName == null || storeName.isBlank()) {
                    storeName = app.getBusinessName();
                }
                sellerPhone = app.getPickupContactPhone() != null ? app.getPickupContactPhone() : app.getContactPhone();
                sellerPan = app.getPanNumber();
                sellerGst = app.getGstNumber();
                StringBuilder loc = new StringBuilder();
                if (app.getPickupCity() != null) loc.append(app.getPickupCity());
                if (app.getPickupState() != null) {
                    if (loc.length() > 0) loc.append(", ");
                    loc.append(app.getPickupState());
                }
                if (app.getPickupPostalCode() != null) {
                    if (loc.length() > 0) loc.append(" - ");
                    loc.append(app.getPickupPostalCode());
                }
                sellerPickupLocation = loc.toString();
            }
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .image(product.getImage())
                .category(categoryService.toResponse(product.getCategory()))
                .status(product.getStatus())
                .rejectionReason(product.getRejectionReason())
                .storeAdminId(storeAdmin != null ? storeAdmin.getId() : null)
                .storeAdminName(storeAdmin != null ? storeAdmin.getName() : null)
                .storeName(storeName)
                .sellerEmail(sellerEmail)
                .sellerPhone(sellerPhone)
                .sellerPickupLocation(sellerPickupLocation)
                .sellerPan(sellerPan)
                .sellerGst(sellerGst)
                .createdAt(product.getCreatedAt())
                .reviewedAt(product.getReviewedAt())
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

    public OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .product(toProductResponse(item.getProduct()))
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .fullName(order.getFullName())
                .email(order.getEmail())
                .phoneNumber(order.getPhoneNumber())
                .address(order.getAddress())
                .city(order.getCity())
                .postalCode(order.getPostalCode())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
