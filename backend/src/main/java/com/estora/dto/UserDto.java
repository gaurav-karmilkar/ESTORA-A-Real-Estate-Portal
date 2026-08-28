package com.estora.dto;

import com.estora.entity.Role;
import com.estora.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private String agency;
    private Boolean isVerified;
    private String avatarUrl;
    private LocalDateTime createdAt;
}
