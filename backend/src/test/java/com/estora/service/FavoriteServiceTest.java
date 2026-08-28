package com.estora.service;

import com.estora.dto.PropertyDto;
import com.estora.entity.*;
import com.estora.exception.BadRequestException;
import com.estora.repository.FavoriteRepository;
import com.estora.repository.PropertyRepository;
import com.estora.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private PropertyService propertyService;

    @InjectMocks
    private FavoriteService favoriteService;

    private User sampleUser;
    private Property sampleProperty;
    private Favorite sampleFavorite;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id(3L).name("Rohan Verma").email("user@estora.com").build();
        sampleProperty = Property.builder()
                .id(1L)
                .title("The Glass Pavilion Residence")
                .price(new BigDecimal("28500000.00"))
                .images(new HashSet<>())
                .amenities(new HashSet<>())
                .agent(User.builder().id(2L).name("Aarav Sharma").build())
                .build();
        sampleFavorite = Favorite.builder().id(1L).user(sampleUser).property(sampleProperty).build();
    }

    @Test
    void testAddFavoriteSuccess() {
        when(favoriteRepository.existsByUserIdAndPropertyId(3L, 1L)).thenReturn(false);
        when(userRepository.findById(3L)).thenReturn(Optional.of(sampleUser));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));
        when(favoriteRepository.save(any(Favorite.class))).thenReturn(sampleFavorite);

        assertDoesNotThrow(() -> favoriteService.addFavorite(3L, 1L));
        verify(favoriteRepository, times(1)).save(any(Favorite.class));
    }

    @Test
    void testAddFavoriteAlreadyExistsThrowsBadRequest() {
        when(favoriteRepository.existsByUserIdAndPropertyId(3L, 1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> favoriteService.addFavorite(3L, 1L));
        verify(favoriteRepository, never()).save(any(Favorite.class));
    }

    @Test
    void testRemoveFavoriteSuccess() {
        when(favoriteRepository.findByUserIdAndPropertyId(3L, 1L)).thenReturn(Optional.of(sampleFavorite));

        assertDoesNotThrow(() -> favoriteService.removeFavorite(3L, 1L));
        verify(favoriteRepository, times(1)).delete(sampleFavorite);
    }
}
