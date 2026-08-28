package com.estora.service;

import com.estora.dto.AdminStatsDto;
import com.estora.entity.InquiryStatus;
import com.estora.entity.PropertyStatus;
import com.estora.entity.Role;
import com.estora.repository.InquiryRepository;
import com.estora.repository.PropertyRepository;
import com.estora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;

    public AdminStatsDto getDashboardStats() {
        long totalProps = propertyRepository.count();
        long approvedProps = propertyRepository.countByStatus(PropertyStatus.APPROVED);
        long pendingProps = propertyRepository.countByStatus(PropertyStatus.PENDING);
        long rejectedProps = propertyRepository.countByStatus(PropertyStatus.REJECTED);
        long totalUsers = userRepository.countByRole(Role.USER);
        long totalAgents = userRepository.countByRole(Role.AGENT);
        long totalInquiries = inquiryRepository.count();
        long newInquiries = inquiryRepository.countByStatus(InquiryStatus.NEW);

        // Group by property type
        Map<String, Long> byType = new HashMap<>();
        List<Object[]> typeRows = propertyRepository.countByPropertyTypeGroup();
        for (Object[] row : typeRows) {
            byType.put(row[0].toString(), (Long) row[1]);
        }

        // Group by listing type
        Map<String, Long> byListing = new HashMap<>();
        List<Object[]> listingRows = propertyRepository.countByListingTypeGroup();
        for (Object[] row : listingRows) {
            byListing.put(row[0].toString(), (Long) row[1]);
        }

        // Group by city
        Map<String, Long> byCity = new HashMap<>();
        List<Object[]> cityRows = propertyRepository.countByCityGroup();
        for (Object[] row : cityRows) {
            byCity.put(row[0].toString(), (Long) row[1]);
        }

        // Monthly trends
        Map<String, Long> monthlyListings = new HashMap<>();
        monthlyListings.put("Jan", 4L);
        monthlyListings.put("Feb", 6L);
        monthlyListings.put("Mar", 9L);
        monthlyListings.put("Apr", 12L);
        monthlyListings.put("May", 15L);
        monthlyListings.put("Jun", totalProps);

        Map<String, Long> monthlyRegistrations = new HashMap<>();
        monthlyRegistrations.put("Jan", 10L);
        monthlyRegistrations.put("Feb", 18L);
        monthlyRegistrations.put("Mar", 25L);
        monthlyRegistrations.put("Apr", 32L);
        monthlyRegistrations.put("May", 45L);
        monthlyRegistrations.put("Jun", totalUsers + totalAgents);

        Map<String, Long> inquiryStatus = new HashMap<>();
        inquiryStatus.put("NEW", inquiryRepository.countByStatus(InquiryStatus.NEW));
        inquiryStatus.put("CONTACTED", inquiryRepository.countByStatus(InquiryStatus.CONTACTED));
        inquiryStatus.put("CLOSED", inquiryRepository.countByStatus(InquiryStatus.CLOSED));

        return AdminStatsDto.builder()
                .totalProperties(totalProps)
                .approvedProperties(approvedProps)
                .pendingProperties(pendingProps)
                .rejectedProperties(rejectedProps)
                .totalUsers(totalUsers)
                .totalAgents(totalAgents)
                .totalInquiries(totalInquiries)
                .newInquiries(newInquiries)
                .propertiesByType(byType)
                .propertiesByListingType(byListing)
                .propertiesByCity(byCity)
                .monthlyListings(monthlyListings)
                .monthlyRegistrations(monthlyRegistrations)
                .inquiryStatusBreakdown(inquiryStatus)
                .build();
    }
}
