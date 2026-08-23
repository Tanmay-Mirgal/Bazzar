package com.bazzar.service;

import com.bazzar.dto.response.ProductResponse;
import com.bazzar.entity.Product;
import com.bazzar.entity.User;
import com.bazzar.entity.Wishlist;
import com.bazzar.exception.BadRequestException;
import com.bazzar.exception.ResourceNotFoundException;
import com.bazzar.repository.ProductRepository;
import com.bazzar.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public WishlistService(WishlistRepository wishlistRepository,
                           ProductRepository productRepository,
                           ProductService productService) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.productService = productService;
    }

    public List<ProductResponse> getWishlist(User user) {
        return wishlistRepository.findByUser(user)
                .stream()
                .map(w -> productService.toResponse(w.getProduct()))
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ProductResponse> addToWishlist(User user, Long productId) {
        if (wishlistRepository.existsByUserAndProductId(user, productId)) {
            throw new BadRequestException("Product already in wishlist");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
        wishlistRepository.save(wishlist);
        return getWishlist(user);
    }

    @Transactional
    public List<ProductResponse> removeFromWishlist(User user, Long productId) {
        if (!wishlistRepository.existsByUserAndProductId(user, productId)) {
            throw new ResourceNotFoundException("Product not in wishlist");
        }
        wishlistRepository.deleteByUserAndProductId(user, productId);
        return getWishlist(user);
    }

    public boolean isInWishlist(User user, Long productId) {
        return wishlistRepository.existsByUserAndProductId(user, productId);
    }
}
