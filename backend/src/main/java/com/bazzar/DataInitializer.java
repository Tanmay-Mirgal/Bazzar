package com.bazzar;

import com.bazzar.entity.Category;
import com.bazzar.entity.Product;
import com.bazzar.repository.CategoryRepository;
import com.bazzar.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final List<String> ALLOWED_CATEGORIES = List.of(
            "Electronics",
            "Footwear",
            "Apparel",
            "Accessories",
            "Home & Office"
    );

    private static class SeedData {
        String name;
        String description;
        BigDecimal price;
        int stock;
        String image;

        SeedData(String name, String description, BigDecimal price, int stock, String image) {
            this.name = name;
            this.description = description;
            this.price = price;
            this.stock = stock;
            this.image = image;
        }
    }

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final com.bazzar.repository.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.bazzar.repository.CartRepository cartRepository;

    public DataInitializer(CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           com.bazzar.repository.UserRepository userRepository,
                           org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                           com.bazzar.repository.CartRepository cartRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.cartRepository = cartRepository;
    }

    @Override
    public void run(String... args) {
        // Seed Admin user if not present
        if (!userRepository.existsByEmail("admin@bazzar.com")) {
            com.bazzar.entity.User admin = com.bazzar.entity.User.builder()
                    .name("Store Admin")
                    .email("admin@bazzar.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(com.bazzar.entity.Role.ROLE_ADMIN)
                    .build();
            admin = userRepository.save(admin);
            cartRepository.save(com.bazzar.entity.Cart.builder().user(admin).build());
            log.info("Admin user seeded: admin@bazzar.com / admin123");
        }

        log.info("Synchronizing categories and products with website specifications...");

        // Ensure target allowed categories exist
        Map<String, Category> allowedCatMap = new HashMap<>();
        for (String catName : ALLOWED_CATEGORIES) {
            Category cat = categoryRepository.findByNameIgnoreCase(catName)
                    .orElseGet(() -> categoryRepository.save(Category.builder().name(catName).build()));
            allowedCatMap.put(catName.toLowerCase(), cat);
        }

        // Re-assign products from obsolete categories to allowed categories to prevent foreign key errors
        List<Category> allExisting = categoryRepository.findAll();
        for (Category existingCat : allExisting) {
            boolean isAllowed = ALLOWED_CATEGORIES.stream()
                    .anyMatch(allowed -> allowed.equalsIgnoreCase(existingCat.getName()));
            if (!isAllowed) {
                log.info("Re-assigning products from obsolete category '{}'...", existingCat.getName());
                Category fallbackCat;
                if (existingCat.getName().equalsIgnoreCase("Clothing")) {
                    fallbackCat = allowedCatMap.get("apparel");
                } else {
                    fallbackCat = allowedCatMap.get("electronics");
                }
                List<Product> obsoleteProducts = productRepository.findByCategoryNameIgnoreCase(existingCat.getName());
                for (Product p : obsoleteProducts) {
                    p.setCategory(fallbackCat);
                    productRepository.save(p);
                }
                try {
                    categoryRepository.delete(existingCat);
                } catch (Exception e) {
                    log.warn("Could not delete category {}, kept without products.", existingCat.getName());
                }
            }
        }

        // Upsert 10 products per allowed category safely
        for (String catName : ALLOWED_CATEGORIES) {
            Category category = allowedCatMap.get(catName.toLowerCase());
            List<SeedData> seeds = getSeedsForCategory(catName);
            List<Product> existingProducts = productRepository.findByCategoryNameIgnoreCase(catName);

            for (int i = 0; i < seeds.size(); i++) {
                SeedData s = seeds.get(i);
                if (i < existingProducts.size()) {
                    Product p = existingProducts.get(i);
                    p.setName(s.name);
                    p.setDescription(s.description);
                    p.setPrice(s.price);
                    p.setStock(s.stock);
                    p.setImage(s.image);
                    p.setCategory(category);
                    productRepository.save(p);
                } else {
                    saveProduct(s.name, s.description, s.price, s.stock, s.image, category);
                }
            }
        }

        log.info("Data initialization complete: {} categories, {} total products in database.",
                categoryRepository.count(), productRepository.count());
    }

    private List<SeedData> getSeedsForCategory(String catName) {
        switch (catName) {
            case "Electronics":
                return getElectronicsSeeds();
            case "Footwear":
                return getFootwearSeeds();
            case "Apparel":
                return getApparelSeeds();
            case "Accessories":
                return getAccessoriesSeeds();
            case "Home & Office":
                return getHomeOfficeSeeds();
            default:
                return Collections.emptyList();
        }
    }

    private List<SeedData> getElectronicsSeeds() {
        return List.of(
            new SeedData("Wireless Bluetooth Headphones", "Premium noise-cancelling over-ear headphones with 30-hour battery life and superior sound quality.", new BigDecimal("2999.00"), 45, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"),
            new SeedData("Smartphone Pro Max", "6.7-inch OLED display, 50MP triple camera system, 5G flagship performance.", new BigDecimal("79999.00"), 20, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"),
            new SeedData("Laptop UltraBook 14", "Thin and light 14-inch laptop with Intel Core i7, 16GB RAM, and 512GB SSD.", new BigDecimal("64999.00"), 15, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"),
            new SeedData("Smart Watch Series 5", "Health-tracking smartwatch with ECG, SpO2 sensor, and 7-day battery life.", new BigDecimal("14999.00"), 30, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"),
            new SeedData("Minimalist Aluminum Mechanical Keyboard", "Compact 75% mechanical keyboard in CNC aluminum with hot-swappable tactile switches.", new BigDecimal("3499.00"), 25, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"),
            new SeedData("Ultra-Wide Curved Gaming Monitor 34\"", "34-inch WQHD 144Hz curved IPS monitor with HDR400 and ultra-narrow bezels.", new BigDecimal("32999.00"), 12, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"),
            new SeedData("Noise-Cancelling True Wireless Earbuds", "Active noise cancellation earbuds with custom spatial audio and wireless charging case.", new BigDecimal("4999.00"), 50, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"),
            new SeedData("Portable Bluetooth Speaker 20W", "IPX7 waterproof 360-degree wireless speaker with dual passive radiators and 18h playback.", new BigDecimal("3299.00"), 40, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"),
            new SeedData("Fast Charging Power Bank 20000mAh", "65W USB-C Power Delivery high-capacity power bank suitable for laptops and phones.", new BigDecimal("2499.00"), 60, "https://images.unsplash.com/photo-1609592424083-a9c1e7a4a205?w=800"),
            new SeedData("4K Ultra HD Web Camera Pro", "Professional 4K webcam with dual noise-reducing microphones and auto light adjustment.", new BigDecimal("5999.00"), 18, "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800")
        );
    }

    private List<SeedData> getFootwearSeeds() {
        return List.of(
            new SeedData("Monochrome Canvas Runner Sneakers", "Streamlined low-top sneakers constructed with durable organic cotton canvas and cushioned insoles.", new BigDecimal("1999.00"), 35, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"),
            new SeedData("Leather Chelsea Boots", "Handcrafted full-grain leather boots with elastic side gores and durable rubber lug outsole.", new BigDecimal("4499.00"), 20, "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800"),
            new SeedData("Breathable Mesh Running Shoes", "Lightweight mesh road running shoes engineered with responsive foam cushioning.", new BigDecimal("2799.00"), 40, "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"),
            new SeedData("Classic Suede Slip-On Loafers", "Elegant suede loafers featuring a plush memory foam footbed and non-slip rubber sole.", new BigDecimal("3299.00"), 22, "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800"),
            new SeedData("Retro High-Top Basketball Sneakers", "Vintage-inspired high-top leather sneakers with padded collar and reinforced ankle support.", new BigDecimal("3899.00"), 18, "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800"),
            new SeedData("Ergonomic Outdoor Trail Sandals", "Adjustable quick-dry webbing strap sandals built for hiking and water adventures.", new BigDecimal("1499.00"), 50, "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800"),
            new SeedData("Flexible Knit Slip-On Trainers", "Sock-like stretch knit trainers designed for seamless comfort and daily movement.", new BigDecimal("2199.00"), 30, "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800"),
            new SeedData("Formal Italian Leather Oxford Shoes", "Hand-polished Italian calfskin leather oxfords tailored for executive dress attire.", new BigDecimal("5499.00"), 15, "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800"),
            new SeedData("Waterproof Trail Hiking Boots", "Heavy-duty waterproof nubuck leather hiking boots with Vibram traction outer lug.", new BigDecimal("5999.00"), 16, "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800"),
            new SeedData("Minimalist Cloud EVA Foam Slides", "Ultra-cushioned cloud EVA slide sandals for indoor relaxation and poolside wear.", new BigDecimal("899.00"), 65, "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800")
        );
    }

    private List<SeedData> getApparelSeeds() {
        return List.of(
            new SeedData("Heavyweight Cotton Boxy Hoodie", "Premium 450gsm organic cotton hoodie featuring a clean boxy silhouette and brushed fleece interior.", new BigDecimal("2499.00"), 30, "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800"),
            new SeedData("Relaxed Fit Linen Button-Down Shirt", "Breathable 100% French linen shirt with soft garment wash and natural pearl buttons.", new BigDecimal("1799.00"), 25, "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"),
            new SeedData("Slim Fit Stretch Denim Jeans", "Modern slim-fit jeans crafted from stretch cotton denim for all-day flexibility.", new BigDecimal("1499.00"), 80, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"),
            new SeedData("Classic Crewneck Organic Cotton Tee", "100% combed organic cotton crewneck t-shirt with reinforced collar and soft drape.", new BigDecimal("599.00"), 120, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"),
            new SeedData("Oversized Streetwear Fleece Pullover", "Drop-shoulder oversized pullover sweatshirt made from heavy fleece knit.", new BigDecimal("2799.00"), 35, "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800"),
            new SeedData("Tailored Wool-Blend Smart Trousers", "Refined pleated trousers cut from breathable wool-blend fabric with elastic waist back.", new BigDecimal("2999.00"), 20, "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800"),
            new SeedData("Lightweight Waterproof Windbreaker Jacket", "Weatherproof lightweight zip jacket featuring cinchable hood and mesh lining.", new BigDecimal("2299.00"), 40, "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800"),
            new SeedData("Ribbed Knit Wool-Blend Crewneck Sweater", "Chunky rib-knit crewneck sweater tailored for minimalist layered warmth.", new BigDecimal("2699.00"), 28, "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800"),
            new SeedData("Utility Cotton Canvas Cargo Joggers", "Durable cotton canvas cargo pants with relaxed taper leg and deep utility pockets.", new BigDecimal("1899.00"), 45, "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800"),
            new SeedData("Minimalist Double-Breasted Trench Coat", "Classic mid-length trench coat crafted from water-resistant twill fabric with belted waist.", new BigDecimal("6499.00"), 12, "https://images.unsplash.com/photo-1544441893-675973e31985?w=800")
        );
    }

    private List<SeedData> getAccessoriesSeeds() {
        return List.of(
            new SeedData("Architectural Matte Black Sunglasses", "Precision Japanese titanium frame sunglasses with scratch-resistant polarized lenses.", new BigDecimal("2799.00"), 18, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800"),
            new SeedData("Waterproof Commuter Backpack 22L", "Structured urban daypack crafted from weatherproof TPU-coated nylon with 16-inch laptop compartment.", new BigDecimal("2899.00"), 25, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"),
            new SeedData("Minimalist Chronograph Leather Watch", "Swiss quartz chronograph watch housed in surgical grade stainless steel with Italian leather strap.", new BigDecimal("4499.00"), 14, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"),
            new SeedData("Slim Genuine Leather Bi-Fold Wallet", "Slim genuine leather bi-fold wallet featuring RFID blocking protection and 8 card slots.", new BigDecimal("999.00"), 75, "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"),
            new SeedData("Pop-Up RFID Aluminum Cardholder", "Sleek pop-up cardholder wallet with quick card ejector mechanism and RFID shield.", new BigDecimal("1299.00"), 50, "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800"),
            new SeedData("Canvas Weekend Travel Duffel Bag 40L", "Spacious heavy-duty cotton canvas duffel with brass hardware and dedicated shoe pocket.", new BigDecimal("3199.00"), 20, "https://images.unsplash.com/photo-1553062407-98eeb64c6a65?w=800"),
            new SeedData("Full-Grain Genuine Leather Dress Belt", "Hand-finished full-grain leather belt equipped with brushed stainless steel buckle.", new BigDecimal("1199.00"), 60, "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800"),
            new SeedData("Merino Wool Ribbed Beanie Cap", "100% fine merino wool rib-knit beanie delivering lightweight moisture-wicking warmth.", new BigDecimal("799.00"), 80, "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800"),
            new SeedData("Polarized Athletic Sport Sunglasses", "Lightweight wrap-around sport sunglasses with non-slip rubber nose pads and UV400 lenses.", new BigDecimal("1599.00"), 35, "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"),
            new SeedData("Tech Travel Cable & Gadget Organizer Pouch", "Water-repellent structured zip organizer pouch with elastic loops and mesh divider pockets.", new BigDecimal("999.00"), 40, "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800")
        );
    }

    private List<SeedData> getHomeOfficeSeeds() {
        return List.of(
            new SeedData("Matte Ceramic Pour-Over Coffee Set", "Handcrafted stoneware coffee carafe and dripper designed for precision extraction.", new BigDecimal("1299.00"), 12, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800"),
            new SeedData("Ergonomic Mesh Desk Chair", "Fully adjustable office chair engineered with breathable Italian mesh and dynamic lumbar support.", new BigDecimal("8999.00"), 10, "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800"),
            new SeedData("Solid Walnut Wood Desk Organizer", "CNC-carved American walnut desk valet tray for pen, phone, and desk accessories.", new BigDecimal("1699.00"), 30, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"),
            new SeedData("Architectural LED Touch Desk Lamp", "Minimalist aluminum task lamp with adjustable color temperatures and wireless charging pad.", new BigDecimal("2499.00"), 25, "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800"),
            new SeedData("Acoustic Felt Desk Mat Pad (Large)", "Natural merino felt desk pad protecting tabletops while dampening keyboard sound.", new BigDecimal("999.00"), 50, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800"),
            new SeedData("Minimalist Ceramic Self-Watering Planter", "Sleek matte ceramic indoor planter with sub-irrigation reservoir for desk plants.", new BigDecimal("799.00"), 45, "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800"),
            new SeedData("Solid Oak Wood Dual Monitor Riser", "Ergonomic wooden desk shelf providing dual monitor elevation and under-keyboard storage.", new BigDecimal("2899.00"), 15, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"),
            new SeedData("Insulated Vacuum Stainless Steel Tumbler 500ml", "Double-wall vacuum insulated matte stainless tumbler keeping drinks hot for 12h or cold for 24h.", new BigDecimal("1099.00"), 60, "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800"),
            new SeedData("Mechanical Auto Flip Desk Clock", "Retro stainless steel battery-powered flip clock with clear vintage numerals.", new BigDecimal("1799.00"), 20, "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800"),
            new SeedData("Scandinavian Chunky Knit Sofa Throw Blanket", "Ultra-soft breathable cotton-blend knit throw blanket for home lounge comfort.", new BigDecimal("1599.00"), 35, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800")
        );
    }

    private void saveProduct(String name, String description, BigDecimal price,
                              int stock, String image, Category category) {
        productRepository.save(Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .stock(stock)
                .image(image)
                .category(category)
                .build());
    }
}
