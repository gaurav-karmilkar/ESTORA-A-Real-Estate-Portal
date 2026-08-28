package com.estora.controller;

import com.estora.dto.ApiResponse;
import com.estora.dto.PropertyDto;
import com.estora.entity.ListingType;
import com.estora.entity.PropertyStatus;
import com.estora.entity.PropertyType;
import com.estora.entity.Role;
import com.estora.security.UserPrincipal;
import com.estora.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProperties(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) ListingType listingType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Integer bathrooms,
            @RequestParam(required = false) BigDecimal minArea,
            @RequestParam(required = false) BigDecimal maxArea,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) PropertyStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Page<PropertyDto> propertyPage = propertyService.getFilteredProperties(
                location, city, locality, propertyType, listingType, minPrice, maxPrice,
                bedrooms, bathrooms, minArea, maxArea, amenities, status, page, size, sort, direction
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", propertyPage.getContent());
        response.put("page", propertyPage.getNumber());
        response.put("size", propertyPage.getSize());
        response.put("totalElements", propertyPage.getTotalElements());
        response.put("totalPages", propertyPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<PropertyDto>>> getFeaturedProperties() {
        List<PropertyDto> featured = propertyService.getFeaturedProperties();
        return ResponseEntity.ok(ApiResponse.success(featured));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PropertyDto>> getPropertyById(@PathVariable Long id) {
        PropertyDto property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(ApiResponse.success("Property retrieved successfully", property));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<PropertyDto>> createProperty(
            @Valid @RequestBody PropertyDto propertyDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        PropertyDto created = propertyService.createProperty(propertyDto, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Property listing created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<PropertyDto>> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyDto propertyDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        PropertyDto updated = propertyService.updateProperty(id, propertyDto, userPrincipal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Property updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        propertyService.deleteProperty(id, userPrincipal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Property deleted successfully", null));
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<ApiResponse<List<PropertyDto>>> getAgentProperties(@PathVariable Long agentId) {
        List<PropertyDto> properties = propertyService.getPropertiesByAgent(agentId);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }
}
