package com.estora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalProperties;
    private long approvedProperties;
    private long pendingProperties;
    private long rejectedProperties;
    private long totalUsers;
    private long totalAgents;
    private long totalInquiries;
    private long newInquiries;

    private Map<String, Long> propertiesByType;
    private Map<String, Long> propertiesByListingType;
    private Map<String, Long> propertiesByCity;
    private Map<String, Long> monthlyListings;
    private Map<String, Long> monthlyRegistrations;
    private Map<String, Long> inquiryStatusBreakdown;
}
