package com.estora.controller;

import com.estora.dto.AdminStatsDto;
import com.estora.dto.ApiResponse;
import com.estora.dto.InquiryDto;
import com.estora.dto.PropertyDto;
import com.estora.dto.UserDto;
import com.estora.entity.PropertyStatus;
import com.estora.entity.UserStatus;
import com.estora.service.AdminService;
import com.estora.service.InquiryService;
import com.estora.service.PropertyService;
import com.estora.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final PropertyService propertyService;
    private final UserService userService;
    private final InquiryService inquiryService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        AdminStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/properties")
    public ResponseEntity<ApiResponse<List<PropertyDto>>> getAllProperties() {
        List<PropertyDto> properties = propertyService.getPropertiesByAgent(null); // or all
        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @PutMapping("/properties/{id}/approve")
    public ResponseEntity<ApiResponse<PropertyDto>> approveProperty(@PathVariable Long id) {
        PropertyDto updated = propertyService.updatePropertyStatus(id, PropertyStatus.APPROVED);
        return ResponseEntity.ok(ApiResponse.success("Property approved successfully", updated));
    }

    @PutMapping("/properties/{id}/reject")
    public ResponseEntity<ApiResponse<PropertyDto>> rejectProperty(@PathVariable Long id) {
        PropertyDto updated = propertyService.updatePropertyStatus(id, PropertyStatus.REJECTED);
        return ResponseEntity.ok(ApiResponse.success("Property rejected", updated));
    }

    @PutMapping("/properties/{id}/feature")
    public ResponseEntity<ApiResponse<PropertyDto>> toggleFeatureProperty(@PathVariable Long id) {
        PropertyDto updated = propertyService.toggleFeatured(id);
        return ResponseEntity.ok(ApiResponse.success("Property feature status updated", updated));
    }

    @DeleteMapping("/properties/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id, null, true);
        return ResponseEntity.ok(ApiResponse.success("Property deleted by admin", null));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status
    ) {
        UserDto updated = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated", updated));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted by admin", null));
    }

    @GetMapping("/agents")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAgents() {
        List<UserDto> agents = userService.getAgents();
        return ResponseEntity.ok(ApiResponse.success(agents));
    }

    @PutMapping("/agents/{id}/verify")
    public ResponseEntity<ApiResponse<UserDto>> verifyAgent(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean verified
    ) {
        UserDto updated = userService.toggleAgentVerification(id, verified);
        return ResponseEntity.ok(ApiResponse.success("Agent verification status updated", updated));
    }

    @GetMapping("/inquiries")
    public ResponseEntity<ApiResponse<List<InquiryDto>>> getAllInquiries() {
        List<InquiryDto> inquiries = inquiryService.getAllInquiries();
        return ResponseEntity.ok(ApiResponse.success(inquiries));
    }
}
