package com.estora.dto;

import com.estora.entity.FurnishingStatus;
import com.estora.entity.ListingType;
import com.estora.entity.PropertyStatus;
import com.estora.entity.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDto {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    @NotNull(message = "Listing type is required")
    private ListingType listingType;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Locality is required")
    private String locality;

    @NotBlank(message = "Address is required")
    private String address;

    private Integer bedrooms;
    private Integer bathrooms;

    @NotNull(message = "Area is required")
    @Positive(message = "Area must be positive")
    private BigDecimal area;

    private Integer parking;
    private FurnishingStatus furnishing;
    private PropertyStatus status;
    private Boolean featured;

    private Long agentId;
    private UserDto agent;
    private List<String> images;
    private Set<String> amenities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
