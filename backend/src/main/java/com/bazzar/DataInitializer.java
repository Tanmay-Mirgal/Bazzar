package com.bazzar;

import com.bazzar.entity.*;
import com.bazzar.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final List<String> ELECTRONIC_CATEGORIES = List.of(
            "Smartphones & Mobiles",
            "Laptops & Computing",
            "Audio & Headphones",
            "Wearables & Smartwatches",
            "Gaming & Consoles",
            "Smart Home & Appliances"
    );

    private static class StoreSeedConfig {
        String name;
        String desc;
        double lat;
        double lng;

        StoreSeedConfig(String name, String desc, double lat, double lng) {
            this.name = name;
            this.desc = desc;
            this.lat = lat;
            this.lng = lng;
        }
    }

    private static class ProductTemplate {
        String catName;
        String namePrefix;
        String desc;
        BigDecimal price;
        String image;

        ProductTemplate(String catName, String namePrefix, String desc, BigDecimal price, String image) {
            this.catName = catName;
            this.namePrefix = namePrefix;
            this.desc = desc;
            this.price = price;
            this.image = image;
        }
    }

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository,
                           StoreRepository storeRepository,
                           JdbcTemplate jdbcTemplate) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting DataInitializer execution for 4-Tier 20-Store 400-Product Electronics Seed Engine...");

        // Ensure database constraints and columns
        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS users ALTER COLUMN password DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_role_check");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS users ADD CONSTRAINT users_role_check CHECK (role IN ('ROLE_USER', 'ROLE_STORE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN'))");
        } catch (Exception e) {
            log.warn("Could not update users table constraints: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS store_admin_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'APPROVED'");
        } catch (Exception ignored) {}

        // Ensure super admin emails
        List<String> superAdminEmails = List.of("tanmaymirgal26@gmail.com", "admin@bazzar.com");
        for (String adminEmail : superAdminEmails) {
            userRepository.findByEmail(adminEmail).ifPresent(u -> {
                if (u.getRole() != Role.ROLE_SUPER_ADMIN) {
                    u.setRole(Role.ROLE_SUPER_ADMIN);
                    userRepository.save(u);
                }
            });
        }

        // 1. Purge Old Products & Items
        try {
            jdbcTemplate.execute("DELETE FROM cart_items");
            jdbcTemplate.execute("DELETE FROM order_items");
            jdbcTemplate.execute("DELETE FROM wishlists");
            int deletedProducts = jdbcTemplate.update("DELETE FROM products");
            log.info("Purged {} old products from database.", deletedProducts);
        } catch (Exception e) {
            log.warn("Error purging products: {}", e.getMessage());
        }

        try {
            // 2. Initialize 6 Pure Electronics Categories
            log.info("Seeding 6 Pure Electronics Categories...");
            Map<String, Category> catMap = new HashMap<>();
            for (String catName : ELECTRONIC_CATEGORIES) {
                Category cat = categoryRepository.findByNameIgnoreCase(catName)
                        .orElseGet(() -> categoryRepository.save(Category.builder().name(catName).build()));
                catMap.put(catName, cat);
            }
            log.info("Categories initialized: {}", catMap.keySet());

            // 3. Define 20 Stores Across 4 Tiers & Build Product Parameters
            List<StoreSeedConfig> storesConfig = get20StoresConfig();
            List<ProductTemplate> templates = getElectronicsProductTemplates();

            int storeCounter = 1;
            List<Object[]> productBatchArgs = new ArrayList<>();

            for (StoreSeedConfig config : storesConfig) {
                final int sc = storeCounter;
                String adminEmail = "storeadmin" + sc + "@bazzar.com";
                User storeAdminUser = userRepository.findByEmail(adminEmail).orElseGet(() -> {
                    User user = User.builder()
                            .name("Store Admin #" + sc)
                            .email(adminEmail)
                            .role(Role.ROLE_STORE_ADMIN)
                            .build();
                    return userRepository.save(user);
                });

                if (storeAdminUser.getRole() != Role.ROLE_STORE_ADMIN) {
                    storeAdminUser.setRole(Role.ROLE_STORE_ADMIN);
                    userRepository.save(storeAdminUser);
                }

                Store store = storeRepository.findByUserId(storeAdminUser.getId()).orElseGet(() -> {
                    Store newStore = Store.builder()
                            .user(storeAdminUser)
                            .storeName(config.name)
                            .storeDescription(config.desc)
                            .latitude(config.lat)
                            .longitude(config.lng)
                            .isQuickDeliveryActive(true)
                            .storeReliabilityScore(4.8 + (sc % 2) * 0.1)
                            .preparationTimeMins(3)
                            .build();
                    return storeRepository.save(newStore);
                });

                // Update store details
                store.setStoreName(config.name);
                store.setStoreDescription(config.desc);
                store.setLatitude(config.lat);
                store.setLongitude(config.lng);
                store.setIsQuickDeliveryActive(true);
                storeRepository.save(store);

                // 4. Build 20 Products for this Store
                for (int i = 0; i < 20; i++) {
                    ProductTemplate t = templates.get(i % templates.size());
                    Category category = catMap.get(t.catName);

                    String productName = t.namePrefix + " (Edition #" + storeCounter + "." + (i + 1) + ")";
                    BigDecimal productPrice = t.price.add(new BigDecimal((i * 150) % 2000));
                    int stock = 25 + (i * 7) % 75;
                    String desc = t.desc + " Mapped to " + config.name + " express dark store dispatch hub.";

                    productBatchArgs.add(new Object[]{
                            productName, desc, productPrice, stock, t.image, category.getId(), storeAdminUser.getId()
                    });
                }

                storeCounter++;
            }

            log.info("Executing ultra-fast JDBC batch insert for {} products...", productBatchArgs.size());
            String insertSql = "INSERT INTO products (name, description, price, stock, image, category_id, store_admin_id, status, created_at) " +
                               "VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED', NOW())";
            jdbcTemplate.batchUpdate(insertSql, productBatchArgs);

            log.info("DataInitializer SUCCESS: Created {} categories, {} stores, and {} total electronic products in database.",
                    categoryRepository.count(), storeRepository.count(), productRepository.count());

        } catch (Exception e) {
            log.error("Fatal exception during DataInitializer seeding execution!", e);
        }
    }

    private List<StoreSeedConfig> get20StoresConfig() {
        return List.of(
                // ⚡ Tier 1: 0 - 2.0 km (Flash 10-Min Dark Stores)
                new StoreSeedConfig("Bazzar BKC Flash Store #101", "Tier 1 Ultra-Flash Dark Store Hub", 19.0674, 72.8687),
                new StoreSeedConfig("Bandra East Express Store #102", "Tier 1 Express Electronics Dark Store", 19.0601, 72.8550),
                new StoreSeedConfig("Kurla West Quick Hub #103", "Tier 1 Instant Dispatch Station", 19.0700, 72.8850),
                new StoreSeedConfig("Santacruz East Dark Store #104", "Tier 1 Hyperlocal Electronics Fulfillment Center", 19.0815, 72.8640),
                new StoreSeedConfig("Kalina Express Point #105", "Tier 1 10-Minute Rapid Delivery Hub", 19.0750, 72.8600),

                // 🚀 Tier 2: 2.0 - 5.0 km (Fast 20-Min Dark Stores)
                new StoreSeedConfig("Dadar West Electronics Hub #201", "Tier 2 Fast Electronics Distribution Hub", 19.0178, 72.8478),
                new StoreSeedConfig("Lower Parel Dark Store #202", "Tier 2 Commercial District Dark Store", 18.9950, 72.8300),
                new StoreSeedConfig("Andheri East Tech Express #203", "Tier 2 Tech Corridor Fulfillment Hub", 19.1136, 72.8697),
                new StoreSeedConfig("Sion Chunabhatti Depot #204", "Tier 2 Quick-Commerce Electronics Station", 19.0531, 72.8752),
                new StoreSeedConfig("Ghatkopar West Gadget Store #205", "Tier 2 Central Suburb Dispatch Point", 19.0860, 72.9080),

                // 🚚 Tier 3: 5.0 - 10.0 km (Standard 45-Min Quick-Commerce Hubs)
                new StoreSeedConfig("Juhu Beach Electronics Hub #301", "Tier 3 Western Coastal Supply Hub", 19.1075, 72.8263),
                new StoreSeedConfig("Powai Tech Park Store #302", "Tier 3 Hitech Residential Dark Store", 19.1176, 72.9060),
                new StoreSeedConfig("Chembur Central Hub #303", "Tier 3 Eastern Corridor Fulfillment Center", 19.0622, 72.8874),
                new StoreSeedConfig("Malad West Gadget World #304", "Tier 3 Suburban Gadget Depot", 19.1860, 72.8485),
                new StoreSeedConfig("Vashi Sector 17 Store #305", "Tier 3 Satellite City Quick Station", 19.0771, 72.9986),

                // 📦 Tier 4: > 10.0 km (National & Regional Fulfillment Warehouses)
                new StoreSeedConfig("Bhiwandi Central Mega Hub #401", "Tier 4 Central Logistics Warehouse", 19.2968, 73.0631),
                new StoreSeedConfig("Panvel Regional Logistics Hub #402", "Tier 4 Regional Freight & Courier Depot", 18.9894, 73.1175),
                new StoreSeedConfig("Thane West Distribution Center #403", "Tier 4 North Metro Mega Fulfillment Center", 19.2183, 72.9781),
                new StoreSeedConfig("Navi Mumbai Industrial Hub #404", "Tier 4 Industrial District Distribution Hub", 19.0330, 73.0297),
                new StoreSeedConfig("Vasai Mega Distro Depot #405", "Tier 4 Outer Regional Express Warehouse", 19.3919, 72.8397)
        );
    }

    private List<ProductTemplate> getElectronicsProductTemplates() {
        return List.of(
                // 1. Smartphones & Mobiles
                new ProductTemplate("Smartphones & Mobiles", "iPhone 15 Pro Max 256GB", "Flagship 6.7-inch Super Retina XDR OLED display, A17 Pro titanium chip, 48MP camera system, 5G performance.", new BigDecimal("129900.00"), "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"),
                new ProductTemplate("Smartphones & Mobiles", "Samsung Galaxy S24 Ultra 5G", "Dynamic AMOLED 2X, S-Pen included, Snapdragon 8 Gen 3, 200MP quad camera.", new BigDecimal("119999.00"), "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800"),
                new ProductTemplate("Smartphones & Mobiles", "Google Pixel 8 Pro", "6.7-inch Super Actua display, Google Tensor G3, AI Magic Eraser, Best Take camera.", new BigDecimal("98999.00"), "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"),
                new ProductTemplate("Smartphones & Mobiles", "OnePlus 12 5G 512GB", "Snapdragon 8 Gen 3, Hasselblad 4th Gen Camera, 100W SUPERVOOC charging.", new BigDecimal("69999.00"), "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800"),

                // 2. Laptops & Computing
                new ProductTemplate("Laptops & Computing", "MacBook Pro 16\" M3 Max", "16-core CPU, 40-core GPU, 36GB Unified Memory, 1TB SSD, Liquid Retina XDR display.", new BigDecimal("249900.00"), "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"),
                new ProductTemplate("Laptops & Computing", "Dell XPS 14 OLED Laptop", "Intel Core Ultra 7, 32GB RAM, 1TB SSD, NVIDIA RTX 4050, 3.2K Touch OLED.", new BigDecimal("184999.00"), "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"),
                new ProductTemplate("Laptops & Computing", "ASUS ROG Zephyrus G16 Gaming Laptop", "Intel Core i9, 16GB RAM, RTX 4070 8GB, 240Hz ROG Nebula OLED display.", new BigDecimal("169990.00"), "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"),
                new ProductTemplate("Laptops & Computing", "Ultra-Wide 34\" Curved Gaming Monitor", "34-inch WQHD 165Hz 1ms IPS Curved Gaming Monitor with HDR400 and USB-C Hub.", new BigDecimal("42999.00"), "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"),

                // 3. Audio & Headphones
                new ProductTemplate("Audio & Headphones", "Sony WH-1000XM5 Wireless Headphones", "Industry-leading noise cancellation with 8 mics, Auto NC Optimizer, 30-hour battery.", new BigDecimal("26990.00"), "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"),
                new ProductTemplate("Audio & Headphones", "Apple AirPods Pro 2nd Gen USB-C", "Active Noise Cancellation, Adaptive Audio, Personalised Spatial Audio, MagSafe Case.", new BigDecimal("24900.00"), "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800"),
                new ProductTemplate("Audio & Headphones", "Bose QuietComfort Ultra Headphones", "Spatialized audio, CustomTune technology, Quiet and Aware Modes, up to 24h battery.", new BigDecimal("34990.00"), "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"),
                new ProductTemplate("Audio & Headphones", "JBL Boombox 3 Portable Speaker", "Massive 180W sound, 24h playtime, IP67 dust/waterproof, built-in powerbank.", new BigDecimal("32999.00"), "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"),

                // 4. Wearables & Smartwatches
                new ProductTemplate("Wearables & Smartwatches", "Apple Watch Ultra 2 GPS + Cellular", "49mm Titanium case, Sapphire front crystal, 3000 nits display, dual-frequency GPS.", new BigDecimal("89900.00"), "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"),
                new ProductTemplate("Wearables & Smartwatches", "Samsung Galaxy Watch 6 Classic", "Rotating bezel, BioActive sensor for ECG/BP, sleep tracking, Sapphire Crystal.", new BigDecimal("36999.00"), "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"),
                new ProductTemplate("Wearables & Smartwatches", "Garmin Fenix 7X Pro Solar", "Multi-band GPS smartwatch, solar charging lens, built-in LED flashlight, endurance score.", new BigDecimal("84990.00"), "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"),

                // 5. Gaming & Consoles
                new ProductTemplate("Gaming & Consoles", "PlayStation 5 Digital Edition Console", "Ultra-high speed SSD, haptic feedback DualSense controller, 4K 120Hz gaming.", new BigDecimal("44990.00"), "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800"),
                new ProductTemplate("Gaming & Consoles", "Xbox Series X 1TB Console", "12 teraflops processing power, 4K gaming at up to 120fps, Xbox Velocity Architecture.", new BigDecimal("55990.00"), "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800"),
                new ProductTemplate("Gaming & Consoles", "Nintendo Switch OLED Model", "7-inch OLED screen, wide adjustable stand, wired LAN dock, 64GB internal storage.", new BigDecimal("31990.00"), "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800"),

                // 6. Smart Home & Appliances
                new ProductTemplate("Smart Home & Appliances", "Dyson V15 Detect Cordless Vacuum", "Laser reveals microscopic dust, Piezo sensor counts particles, 60-min run time.", new BigDecimal("65900.00"), "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800"),
                new ProductTemplate("Smart Home & Appliances", "Philips Hue Smart RGB Lightstrip 2M", "16 million colors, voice control with Alexa/Google Assistant, flexible ambient light.", new BigDecimal("6999.00"), "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800"),
                new ProductTemplate("Smart Home & Appliances", "Amazon Echo Studio Smart Speaker", "Hi-Fi spatial audio with Dolby Atmos, built-in Zigbee smart home hub.", new BigDecimal("22999.00"), "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800")
        );
    }
}
