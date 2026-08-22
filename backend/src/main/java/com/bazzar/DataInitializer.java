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
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DataInitializer(CategoryRepository categoryRepository,
                           ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        // Only seed if the database is empty
        if (categoryRepository.count() > 0) {
            log.info("Database already seeded – skipping data initialization.");
            return;
        }

        log.info("Seeding initial data...");

        // ── Categories ──────────────────────────────────────────────────────────
        Category electronics  = saveCategory("Electronics");
        Category clothing     = saveCategory("Clothing");
        Category books        = saveCategory("Books");
        Category accessories  = saveCategory("Accessories");

        // ── Products ────────────────────────────────────────────────────────────

        // Electronics
        saveProduct("Wireless Bluetooth Headphones",
                "Premium noise-cancelling headphones with 30-hour battery life and superior sound quality.",
                new BigDecimal("2999.00"), 45, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", electronics);

        saveProduct("Smartphone Pro Max",
                "6.7-inch OLED display, 50MP triple camera, 5G capable flagship smartphone.",
                new BigDecimal("79999.00"), 20, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", electronics);

        saveProduct("Laptop UltraBook 14",
                "Thin and light 14-inch laptop with Intel Core i7, 16GB RAM, and 512GB SSD.",
                new BigDecimal("64999.00"), 15, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", electronics);

        saveProduct("Smart Watch Series 5",
                "Health-tracking smartwatch with ECG, SpO2 sensor, and 7-day battery life.",
                new BigDecimal("14999.00"), 30, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", electronics);

        // Clothing
        saveProduct("Classic Cotton T-Shirt",
                "100% premium cotton, breathable and comfortable everyday t-shirt available in multiple colors.",
                new BigDecimal("599.00"), 120, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", clothing);

        saveProduct("Slim Fit Denim Jeans",
                "Modern slim-fit jeans crafted from stretch denim for all-day comfort.",
                new BigDecimal("1499.00"), 80, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", clothing);

        saveProduct("Hooded Sweatshirt",
                "Cozy fleece-lined hoodie perfect for chilly evenings, available in various sizes.",
                new BigDecimal("1299.00"), 60, "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400", clothing);

        // Books
        saveProduct("Clean Code",
                "A handbook of agile software craftsmanship by Robert C. Martin. Essential for every developer.",
                new BigDecimal("699.00"), 50, "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400", books);

        saveProduct("The Pragmatic Programmer",
                "Classic software development guide filled with practical advice for modern programmers.",
                new BigDecimal("799.00"), 35, "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400", books);

        // Accessories
        saveProduct("Leather Wallet",
                "Slim genuine leather bi-fold wallet with RFID blocking protection.",
                new BigDecimal("999.00"), 75, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", accessories);

        saveProduct("Sunglasses UV400",
                "Stylish polarized sunglasses offering full UV400 protection for outdoor adventures.",
                new BigDecimal("1199.00"), 55, "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", accessories);

        saveProduct("Canvas Backpack",
                "Durable 30L canvas backpack with laptop compartment and ergonomic shoulder straps.",
                new BigDecimal("2499.00"), 40, "https://images.unsplash.com/photo-1553062407-98eeb64c6a65?w=400", accessories);

        log.info("Data initialization complete: {} categories, {} products seeded.",
                categoryRepository.count(), productRepository.count());
    }

    private Category saveCategory(String name) {
        return categoryRepository.save(Category.builder().name(name).build());
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
