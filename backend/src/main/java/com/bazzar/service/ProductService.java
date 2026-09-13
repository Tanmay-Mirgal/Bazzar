package com.bazzar.service;

import com.bazzar.dto.request.ProductRequest;
import com.bazzar.dto.response.ProductResponse;
import com.bazzar.entity.Category;
import com.bazzar.entity.Product;
import com.bazzar.entity.ProductStatus;
import com.bazzar.exception.ResourceNotFoundException;
import com.bazzar.repository.CategoryRepository;
import com.bazzar.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Public-facing product service — only exposes APPROVED products.
 * Admin-specific product operations are handled by StoreAdminService / SuperAdminService.
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final StoreAdminService storeAdminService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          CategoryService categoryService,
                          StoreAdminService storeAdminService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.categoryService = categoryService;
        this.storeAdminService = storeAdminService;
    }

    /** Returns only APPROVED products for the public storefront. */
    public List<ProductResponse> getAllProducts(String search, String category) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanCategory = (category != null && !category.trim().isEmpty()) ? category.trim() : null;

        List<Product> products;
        if (cleanSearch == null && cleanCategory == null) {
            products = productRepository.findByStatus(ProductStatus.APPROVED);
        } else if (cleanSearch == null) {
            products = productRepository.findByCategoryNameIgnoreCaseAndStatus(cleanCategory, ProductStatus.APPROVED);
        } else if (cleanCategory == null) {
            // Filter by status after search since JPA derived method is complex
            products = productRepository
                    .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(cleanSearch, cleanSearch)
                    .stream()
                    .filter(p -> p.getStatus() == ProductStatus.APPROVED)
                    .collect(Collectors.toList());
        } else {
            products = productRepository
                    .findByCategoryNameIgnoreCaseAndSearch(cleanCategory, cleanSearch)
                    .stream()
                    .filter(p -> p.getStatus() == ProductStatus.APPROVED)
                    .collect(Collectors.toList());
        }

        return products.stream()
                .map(storeAdminService::toProductResponse)
                .collect(Collectors.toList());
    }

    /** Returns an APPROVED product by ID, or throws 404. */
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.getStatus() != ProductStatus.APPROVED) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }

        return storeAdminService.toProductResponse(product);
    }

    /** Returns top N approved products for the featured section on the homepage. */
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByStatus(ProductStatus.APPROVED)
                .stream()
                .limit(8)
                .map(storeAdminService::toProductResponse)
                .collect(Collectors.toList());
    }

    /** Converts a Product entity to a ProductResponse DTO (delegates to StoreAdminService). */
    public ProductResponse toResponse(Product product) {
        return storeAdminService.toProductResponse(product);
    }

    // ── Legacy admin CRUD (kept for backward compat, super_admin only) ───────

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
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
                .status(ProductStatus.APPROVED) // Super admin creates auto-approved
                .build();

        return storeAdminService.toProductResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImage(request.getImage());
        product.setCategory(category);

        return storeAdminService.toProductResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}
