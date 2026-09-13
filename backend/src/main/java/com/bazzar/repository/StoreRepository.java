package com.bazzar.repository;

import com.bazzar.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByUserId(Long userId);
    List<Store> findByIsActiveTrue();
    boolean existsByUserId(Long userId);
    long countByIsActiveTrue();
}
