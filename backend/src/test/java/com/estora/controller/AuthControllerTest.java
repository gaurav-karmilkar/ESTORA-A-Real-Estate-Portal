package com.estora.controller;

import com.estora.dto.AuthRequest;
import com.estora.dto.AuthResponse;
import com.estora.dto.RegisterRequest;
import com.estora.security.JwtTokenProvider;
import com.estora.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testLoginEndpoint() throws Exception {
        AuthRequest authRequest = new AuthRequest("user@estora.com", "password123");
        AuthResponse authResponse = AuthResponse.builder()
                .token("mock-jwt-token")
                .id(1L)
                .name("Rohan Verma")
                .email("user@estora.com")
                .role("USER")
                .build();

        when(authService.login(any(AuthRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.email").value("user@estora.com"))
                .andExpect(jsonPath("$.name").value("Rohan Verma"));
    }

    @Test
    void testRegisterEndpoint() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .name("Rohan Verma")
                .email("user@estora.com")
                .password("password123")
                .phone("+91 97123 77889")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .token("mock-jwt-token")
                .id(1L)
                .name("Rohan Verma")
                .email("user@estora.com")
                .role("USER")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.email").value("user@estora.com"));
    }
}
