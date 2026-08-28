package com.estora.service;

import com.estora.dto.PropertyDto;
import com.estora.entity.*;
import com.estora.exception.ResourceNotFoundException;
import com.estora.repository.PropertyImageRepository;
import com.estora.repository.PropertyRepository;
import com.estora.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyServiceTest {

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private PropertyImageRepository propertyImageRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PropertyService propertyService;

    private User sampleAgent;
    private Property sampleProperty;

    @BeforeEach
    void setUp() {
        sampleAgent = User.builder()
                .id(2L)
                .name("Aarav Sharma")
                .email("agent@estora.com")
                .role(Role.AGENT)
                .build();

        sampleProperty = Property.builder()
                .id(1L)
                .title("The Glass Pavilion Residence")
                .description("Ultra luxury apartment in Bandra West")
                .price(new BigDecimal("28500000.00"))
                .propertyType(PropertyType.APARTMENT)
                .listingType(ListingType.BUY)
                .status(PropertyStatus.APPROVED)
                .city("Mumbai")
                .locality("Bandra West")
                .address("Carter Road, Bandra West, Mumbai")
                .bedrooms(3)
                .bathrooms(3)
                .area(new BigDecimal("2150.00"))
                .parking(2)
                .furnishing(FurnishingStatus.FURNISHED)
                .featured(true)
                .agent(sampleAgent)
                .images(new HashSet<>())
                .amenities(new HashSet<>())
                .build();
    }

    @Test
    void testGetPropertyByIdSuccess() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));

        PropertyDto result = propertyService.getPropertyById(1L);

        assertNotNull(result);
        assertEquals("The Glass Pavilion Residence", result.getTitle());
        assertEquals("Mumbai", result.getCity());
        assertEquals(new BigDecimal("28500000.00"), result.getPrice());
    }

    @Test
    void testGetPropertyByIdNotFound() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> propertyService.getPropertyById(999L));
    }

    @Test
    void testGetFilteredPropertiesReturnsPage() {
        Page<Property> propertyPage = new PageImpl<>(List.of(sampleProperty));
        when(propertyRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(propertyPage);

        Page<PropertyDto> result = propertyService.getFilteredProperties(
                "Bandra", "Mumbai", null, PropertyType.APARTMENT, ListingType.BUY,
                null, null, 3, null, null, null, null, PropertyStatus.APPROVED,
                0, 12, "createdAt", "DESC"
        );

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("The Glass Pavilion Residence", result.getContent().get(0).getTitle());
    }
}
