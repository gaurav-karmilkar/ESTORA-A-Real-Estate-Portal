package com.estora.service;

import com.estora.dto.InquiryDto;
import com.estora.entity.Inquiry;
import com.estora.entity.InquiryStatus;
import com.estora.entity.Property;
import com.estora.entity.User;
import com.estora.exception.ResourceNotFoundException;
import com.estora.repository.InquiryRepository;
import com.estora.repository.PropertyRepository;
import com.estora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public List<InquiryDto> getAllInquiries() {
        return inquiryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<InquiryDto> getInquiriesByUser(Long userId) {
        return inquiryRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<InquiryDto> getInquiriesByAgent(Long agentId) {
        return inquiryRepository.findByAgentId(agentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public InquiryDto createInquiry(InquiryDto dto, Long userId) {
        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + dto.getPropertyId()));

        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        User agent = property.getAgent();

        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .property(property)
                .agent(agent)
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .message(dto.getMessage())
                .status(InquiryStatus.NEW)
                .build();

        return mapToDto(inquiryRepository.save(inquiry));
    }

    @Transactional
    public InquiryDto updateInquiryStatus(Long id, InquiryStatus status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with id: " + id));
        inquiry.setStatus(status);
        return mapToDto(inquiryRepository.save(inquiry));
    }

    @Transactional
    public void deleteInquiry(Long id) {
        if (!inquiryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inquiry not found with id: " + id);
        }
        inquiryRepository.deleteById(id);
    }

    public InquiryDto mapToDto(Inquiry inquiry) {
        if (inquiry == null) return null;
        return InquiryDto.builder()
                .id(inquiry.getId())
                .userId(inquiry.getUser() != null ? inquiry.getUser().getId() : null)
                .propertyId(inquiry.getProperty().getId())
                .propertyTitle(inquiry.getProperty().getTitle())
                .propertyCity(inquiry.getProperty().getCity())
                .agentId(inquiry.getAgent().getId())
                .agentName(inquiry.getAgent().getName())
                .name(inquiry.getName())
                .email(inquiry.getEmail())
                .phone(inquiry.getPhone())
                .message(inquiry.getMessage())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
