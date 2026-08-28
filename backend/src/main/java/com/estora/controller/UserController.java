package com.estora.controller;

import com.estora.dto.ApiResponse;
import com.estora.dto.UserDto;
import com.estora.security.UserPrincipal;
import com.estora.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        UserDto userDto = UserDto.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .agency(request.getAgency())
                .avatarUrl(request.getAvatarUrl())
                .build();

        UserDto updated = userService.updateProfile(userPrincipal.getId(), userDto, request.getPassword());
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @Data
    public static class ProfileUpdateRequest {
        private String name;
        private String phone;
        private String agency;
        private String avatarUrl;
        private String password;
    }
}
