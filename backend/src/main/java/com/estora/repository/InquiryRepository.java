package com.estora.repository;

import com.estora.entity.Inquiry;
import com.estora.entity.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByUserId(Long userId);
    List<Inquiry> findByAgentId(Long agentId);
    List<Inquiry> findByPropertyId(Long propertyId);
    long countByStatus(InquiryStatus status);
}
