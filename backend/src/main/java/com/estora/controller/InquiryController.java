package com.estora.controller;

import com.estora.dto.ApiResponse;
import com.estora.dto.InquiryDto;
import com.estora.entity.InquiryStatus;
import com.estora.security.UserPrincipal;
import com.estora.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    public ResponseEntity<ApiResponse<InquiryDto>> createInquiry(
            @Valid @RequestBody InquiryDto inquiryDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        InquiryDto created = inquiryService.createInquiry(inquiryDto, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inquiry submitted successfully! The agent will contact you soon.", created));
    }

    @GetMapping("/my-inquiries")
    public ResponseEntity<ApiResponse<List<InquiryDto>>> getMyInquiries(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        List<InquiryDto> inquiries = inquiryService.getInquiriesByUser(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(inquiries));
    }

    @GetMapping("/agent")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<InquiryDto>>> getAgentInquiries(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        List<InquiryDto> inquiries = inquiryService.getInquiriesByAgent(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(inquiries));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<InquiryDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam InquiryStatus status
    ) {
        InquiryDto updated = inquiryService.updateInquiryStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Inquiry status updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteInquiry(@PathVariable Long id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.ok(ApiResponse.success("Inquiry deleted successfully", null));
    }
}
