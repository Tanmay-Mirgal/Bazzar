package com.bazzar.repository;

import com.bazzar.entity.User;
import com.bazzar.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUser(User user);
    Optional<Wishlist> findByUserAndProductId(User user, Long productId);
    boolean existsByUserAndProductId(User user, Long productId);
    void deleteByUserAndProductId(User user, Long productId);
}
