package com.estora.service;

import com.estora.dto.AuthRequest;
import com.estora.dto.AuthResponse;
import com.estora.dto.RegisterRequest;
import com.estora.entity.Role;
import com.estora.entity.User;
import com.estora.entity.UserStatus;
import com.estora.exception.BadRequestException;
import com.estora.repository.UserRepository;
import com.estora.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private RegisterRequest registerRequest;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Rohan Verma")
                .email("user@estora.com")
                .password("encodedPassword123")
                .phone("+91 97123 77889")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        registerRequest = RegisterRequest.builder()
                .name("Rohan Verma")
                .email("user@estora.com")
                .password("password123")
                .phone("+91 97123 77889")
                .role(Role.USER)
                .build();

        authRequest = new AuthRequest("user@estora.com", "password123");
    }

    @Test
    void testRegisterSuccess() {
        when(userRepository.existsByEmail("user@estora.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateToken(any())).thenReturn("mocked-jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("user@estora.com", response.getEmail());
        assertEquals("USER", response.getRole());
        assertEquals("mocked-jwt-token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterDuplicateEmailThrowsBadRequest() {
        when(userRepository.existsByEmail("user@estora.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLoginSuccess() {
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail("user@estora.com")).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateToken(auth)).thenReturn("mocked-jwt-token");

        AuthResponse response = authService.login(authRequest);

        assertNotNull(response);
        assertEquals("user@estora.com", response.getEmail());
        assertEquals("mocked-jwt-token", response.getToken());
    }
}
