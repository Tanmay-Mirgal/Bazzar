package com.bazzar.repository;

import com.bazzar.entity.Product;
import com.bazzar.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ── Public listing (only APPROVED) ──────────────────────────────────────
    List<Product> findByStatus(ProductStatus status);

    List<Product> findByCategoryNameIgnoreCaseAndStatus(String categoryName, ProductStatus status);

    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndStatus(
            String name, String description, ProductStatus status);

    @Query("SELECT p FROM Product p WHERE LOWER(p.category.name) = LOWER(:category) AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND p.status = :status")
    List<Product> findByCategoryNameIgnoreCaseAndSearchAndStatus(
            @Param("category") String category,
            @Param("search") String search,
            @Param("status") ProductStatus status);

    // ── Store Admin: own products ────────────────────────────────────────────
    List<Product> findByStoreAdminId(Long storeAdminId);

    List<Product> findByStoreAdminIdAndStatus(Long storeAdminId, ProductStatus status);

    // ── Super Admin: pending approval ────────────────────────────────────────
    List<Product> findByStatusOrderByCreatedAtAsc(ProductStatus status);

    // ── Legacy queries (keep for backward compatibility) ─────────────────────
    List<Product> findByCategoryNameIgnoreCase(String categoryName);

    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    @Query("SELECT p FROM Product p WHERE LOWER(p.category.name) = LOWER(:category) AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Product> findByCategoryNameIgnoreCaseAndSearch(@Param("category") String category, @Param("search") String search);

    // ── Stats ────────────────────────────────────────────────────────────────
    long countByStatus(ProductStatus status);
    long countByStoreAdminId(Long storeAdminId);
}
