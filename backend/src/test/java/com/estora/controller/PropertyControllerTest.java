package com.estora.controller;

import com.estora.dto.PropertyDto;
import com.estora.security.JwtTokenProvider;
import com.estora.service.PropertyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PropertyController.class)
@AutoConfigureMockMvc(addFilters = false)
public class PropertyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PropertyService propertyService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void testGetPropertyById() throws Exception {
        PropertyDto propertyDto = PropertyDto.builder()
                .id(1L)
                .title("The Glass Pavilion Residence")
                .price(new BigDecimal("28500000.00"))
                .city("Mumbai")
                .locality("Bandra West")
                .bedrooms(3)
                .bathrooms(3)
                .build();

        when(propertyService.getPropertyById(1L)).thenReturn(propertyDto);

        mockMvc.perform(get("/api/properties/1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("The Glass Pavilion Residence"))
                .andExpect(jsonPath("$.city").value("Mumbai"));
    }

    @Test
    void testGetFeaturedProperties() throws Exception {
        PropertyDto propertyDto = PropertyDto.builder()
                .id(1L)
                .title("The Glass Pavilion Residence")
                .featured(true)
                .build();

        when(propertyService.getFeaturedProperties()).thenReturn(List.of(propertyDto));

        mockMvc.perform(get("/api/properties/featured")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].featured").value(true));
    }
}
