package com.estora.dto;

import com.estora.entity.InquiryStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryDto {
    private Long id;
    private Long userId;

    @NotNull(message = "Property ID is required")
    private Long propertyId;
    private String propertyTitle;
    private String propertyCity;

    private Long agentId;
    private String agentName;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Message is required")
    private String message;

    private InquiryStatus status;
    private LocalDateTime createdAt;
}
