package com.estora.repository;

import com.estora.entity.Property;
import com.estora.entity.PropertyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    List<Property> findByStatus(PropertyStatus status);
    List<Property> findByStatusAndFeaturedTrue(PropertyStatus status);
    List<Property> findByAgentId(Long agentId);
    long countByStatus(PropertyStatus status);

    @Query("SELECT p.propertyType, COUNT(p) FROM Property p GROUP BY p.propertyType")
    List<Object[]> countByPropertyTypeGroup();

    @Query("SELECT p.listingType, COUNT(p) FROM Property p GROUP BY p.listingType")
    List<Object[]> countByListingTypeGroup();

    @Query("SELECT p.city, COUNT(p) FROM Property p GROUP BY p.city")
    List<Object[]> countByCityGroup();

    @Query("SELECT p FROM Property p WHERE p.status = 'APPROVED' AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.locality) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Property> searchApprovedProperties(@Param("query") String query, Pageable pageable);
}
