package com.bazzar.repository;

import com.bazzar.entity.Order;
import com.bazzar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i JOIN i.product p WHERE p.storeAdmin.id = :storeAdminId ORDER BY o.createdAt DESC")
    List<Order> findOrdersByStoreAdminId(@Param("storeAdminId") Long storeAdminId);
}
