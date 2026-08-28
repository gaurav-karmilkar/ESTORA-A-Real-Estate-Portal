package com.estora.service;

import com.estora.dto.PropertyDto;
import com.estora.entity.*;
import com.estora.exception.BadRequestException;
import com.estora.exception.ResourceNotFoundException;
import com.estora.repository.AmenityRepository;
import com.estora.repository.PropertyImageRepository;
import com.estora.repository.PropertyRepository;
import com.estora.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final AmenityRepository amenityRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public Page<PropertyDto> getFilteredProperties(
            String location,
            String city,
            String locality,
            PropertyType propertyType,
            ListingType listingType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer bedrooms,
            Integer bathrooms,
            BigDecimal minArea,
            BigDecimal maxArea,
            List<String> amenities,
            PropertyStatus status,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection != null ? sortDirection : "DESC"), 
                sortBy != null ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Property> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status filter: defaults to APPROVED for public searches unless specified
            PropertyStatus targetStatus = status != null ? status : PropertyStatus.APPROVED;
            predicates.add(criteriaBuilder.equal(root.get("status"), targetStatus));

            if (city != null && !city.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("city")), city.toLowerCase().trim()));
            }

            if (locality != null && !locality.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("locality")), "%" + locality.toLowerCase().trim() + "%"));
            }

            if (location != null && !location.trim().isEmpty()) {
                String loc = "%" + location.toLowerCase().trim() + "%";
                Predicate cityMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("city")), loc);
                Predicate locMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("locality")), loc);
                Predicate addrMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("address")), loc);
                Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), loc);
                predicates.add(criteriaBuilder.or(cityMatch, locMatch, addrMatch, titleMatch));
            }

            if (propertyType != null) {
                predicates.add(criteriaBuilder.equal(root.get("propertyType"), propertyType));
            }

            if (listingType != null) {
                predicates.add(criteriaBuilder.equal(root.get("listingType"), listingType));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (bedrooms != null && bedrooms > 0) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("bedrooms"), bedrooms));
            }

            if (bathrooms != null && bathrooms > 0) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("bathrooms"), bathrooms));
            }

            if (minArea != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("area"), minArea));
            }

            if (maxArea != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("area"), maxArea));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return propertyRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    public List<PropertyDto> getFeaturedProperties() {
        return propertyRepository.findByStatusAndFeaturedTrue(PropertyStatus.APPROVED)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PropertyDto getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
        return mapToDto(property);
    }

    public List<PropertyDto> getPropertiesByAgent(Long agentId) {
        return propertyRepository.findByAgentId(agentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PropertyDto createProperty(PropertyDto dto, Long agentId) {
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + agentId));

        if (agent.getRole() != Role.AGENT && agent.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only registered agents or admins can create property listings");
        }

        Property property = Property.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .propertyType(dto.getPropertyType())
                .listingType(dto.getListingType())
                .city(dto.getCity())
                .locality(dto.getLocality())
                .address(dto.getAddress())
                .bedrooms(dto.getBedrooms() != null ? dto.getBedrooms() : 0)
                .bathrooms(dto.getBathrooms() != null ? dto.getBathrooms() : 0)
                .area(dto.getArea())
                .parking(dto.getParking() != null ? dto.getParking() : 0)
                .furnishing(dto.getFurnishing() != null ? dto.getFurnishing() : FurnishingStatus.UNFURNISHED)
                .status(agent.getRole() == Role.ADMIN ? PropertyStatus.APPROVED : PropertyStatus.PENDING)
                .featured(dto.getFeatured() != null ? dto.getFeatured() : false)
                .agent(agent)
                .build();

        // Handle amenities
        if (dto.getAmenities() != null && !dto.getAmenities().isEmpty()) {
            Set<Amenity> amenityEntities = new HashSet<>();
            for (String amenityName : dto.getAmenities()) {
                Amenity amenity = amenityRepository.findByName(amenityName)
                        .orElseGet(() -> amenityRepository.save(Amenity.builder().name(amenityName).build()));
                amenityEntities.add(amenity);
            }
            property.setAmenities(amenityEntities);
        }

        Property savedProperty = propertyRepository.save(property);

        // Handle images
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            List<PropertyImage> imageEntities = new ArrayList<>();
            for (int i = 0; i < dto.getImages().size(); i++) {
                PropertyImage img = PropertyImage.builder()
                        .property(savedProperty)
                        .imageUrl(dto.getImages().get(i))
                        .isPrimary(i == 0)
                        .build();
                imageEntities.add(propertyImageRepository.save(img));
            }
            savedProperty.setImages(imageEntities);
        }

        return mapToDto(savedProperty);
    }

    @Transactional
    public PropertyDto updateProperty(Long id, PropertyDto dto, Long userId, boolean isAdmin) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        if (!isAdmin && !property.getAgent().getId().equals(userId)) {
            throw new BadRequestException("You can only edit your own listings");
        }

        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setPrice(dto.getPrice());
        property.setPropertyType(dto.getPropertyType());
        property.setListingType(dto.getListingType());
        property.setCity(dto.getCity());
        property.setLocality(dto.getLocality());
        property.setAddress(dto.getAddress());
        property.setBedrooms(dto.getBedrooms());
        property.setBathrooms(dto.getBathrooms());
        property.setArea(dto.getArea());
        property.setParking(dto.getParking());
        property.setFurnishing(dto.getFurnishing());
        if (dto.getStatus() != null && isAdmin) {
            property.setStatus(dto.getStatus());
        }
        if (dto.getFeatured() != null && isAdmin) {
            property.setFeatured(dto.getFeatured());
        }

        return mapToDto(propertyRepository.save(property));
    }

    @Transactional
    public void deleteProperty(Long id, Long userId, boolean isAdmin) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        if (!isAdmin && !property.getAgent().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own listings");
        }

        propertyRepository.delete(property);
    }

    @Transactional
    public PropertyDto updatePropertyStatus(Long id, PropertyStatus status) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
        property.setStatus(status);
        return mapToDto(propertyRepository.save(property));
    }

    @Transactional
    public PropertyDto toggleFeatured(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
        property.setFeatured(!Boolean.TRUE.equals(property.getFeatured()));
        return mapToDto(propertyRepository.save(property));
    }

    public PropertyDto mapToDto(Property property) {
        if (property == null) return null;

        List<String> images = property.getImages() != null ? property.getImages().stream()
                .map(PropertyImage::getImageUrl)
                .collect(Collectors.toList()) : Collections.emptyList();

        Set<String> amenities = property.getAmenities() != null ? property.getAmenities().stream()
                .map(Amenity::getName)
                .collect(Collectors.toSet()) : Collections.emptySet();

        return PropertyDto.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .price(property.getPrice())
                .propertyType(property.getPropertyType())
                .listingType(property.getListingType())
                .city(property.getCity())
                .locality(property.getLocality())
                .address(property.getAddress())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .area(property.getArea())
                .parking(property.getParking())
                .furnishing(property.getFurnishing())
                .status(property.getStatus())
                .featured(property.getFeatured())
                .agentId(property.getAgent() != null ? property.getAgent().getId() : null)
                .agent(property.getAgent() != null ? userService.mapToDto(property.getAgent()) : null)
                .images(images)
                .amenities(amenities)
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }
}
