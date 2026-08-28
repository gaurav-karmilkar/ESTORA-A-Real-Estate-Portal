package com.estora.service;

import com.estora.dto.PropertyDto;
import com.estora.entity.Favorite;
import com.estora.entity.Property;
import com.estora.entity.User;
import com.estora.exception.BadRequestException;
import com.estora.exception.ResourceNotFoundException;
import com.estora.repository.FavoriteRepository;
import com.estora.repository.PropertyRepository;
import com.estora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;

    public List<PropertyDto> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(Favorite::getProperty)
                .map(propertyService::mapToDto)
                .collect(Collectors.toList());
    }

    public List<Long> getUserFavoritePropertyIds(Long userId) {
        return favoriteRepository.findByUserId(userId).stream()
                .map(fav -> fav.getProperty().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(Long userId, Long propertyId) {
        if (favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            return; // Already favorited
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        Favorite favorite = Favorite.builder()
                .user(user)
                .property(property)
                .build();

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long userId, Long propertyId) {
        favoriteRepository.deleteByUserIdAndPropertyId(userId, propertyId);
    }
}
