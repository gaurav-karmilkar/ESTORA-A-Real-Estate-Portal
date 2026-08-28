package com.estora.service;

import com.estora.dto.InquiryDto;
import com.estora.entity.*;
import com.estora.exception.ResourceNotFoundException;
import com.estora.repository.InquiryRepository;
import com.estora.repository.PropertyRepository;
import com.estora.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InquiryServiceTest {

    @Mock
    private InquiryRepository inquiryRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InquiryService inquiryService;

    private User sampleUser;
    private User sampleAgent;
    private Property sampleProperty;
    private Inquiry sampleInquiry;
    private InquiryDto inquiryDto;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id(3L).name("Rohan Verma").email("user@estora.com").build();
        sampleAgent = User.builder().id(2L).name("Aarav Sharma").email("agent@estora.com").build();
        sampleProperty = Property.builder().id(1L).title("The Glass Pavilion Residence").agent(sampleAgent).build();
        sampleInquiry = Inquiry.builder()
                .id(1L)
                .user(sampleUser)
                .property(sampleProperty)
                .agent(sampleAgent)
                .name("Rohan Verma")
                .email("user@estora.com")
                .phone("+91 97123 77889")
                .message("Interested in viewing this estate")
                .status(InquiryStatus.NEW)
                .build();

        inquiryDto = InquiryDto.builder()
                .propertyId(1L)
                .agentId(2L)
                .name("Rohan Verma")
                .email("user@estora.com")
                .phone("+91 97123 77889")
                .message("Interested in viewing this estate")
                .build();
    }

    @Test
    void testCreateInquirySuccess() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));
        when(userRepository.findById(3L)).thenReturn(Optional.of(sampleUser));
        when(inquiryRepository.save(any(Inquiry.class))).thenReturn(sampleInquiry);

        InquiryDto result = inquiryService.createInquiry(3L, inquiryDto);

        assertNotNull(result);
        assertEquals("Rohan Verma", result.getName());
        assertEquals("NEW", result.getStatus());
        verify(inquiryRepository, times(1)).save(any(Inquiry.class));
    }

    @Test
    void testCreateInquiryPropertyNotFound() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());
        inquiryDto.setPropertyId(999L);

        assertThrows(ResourceNotFoundException.class, () -> inquiryService.createInquiry(3L, inquiryDto));
    }
}
