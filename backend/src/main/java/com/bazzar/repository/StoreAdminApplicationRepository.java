package com.bazzar.repository;

import com.bazzar.entity.StoreAdminApplication;
import com.bazzar.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StoreAdminApplicationRepository extends JpaRepository<StoreAdminApplication, Long> {
    Optional<StoreAdminApplication> findByUserId(Long userId);
    List<StoreAdminApplication> findByStatus(ApplicationStatus status);
    List<StoreAdminApplication> findAllByOrderByCreatedAtDesc();
    boolean existsByUserId(Long userId);
    long countByStatus(ApplicationStatus status);
}
