package com.estora.controller;

import com.estora.dto.ApiResponse;
import com.estora.dto.PropertyDto;
import com.estora.security.UserPrincipal;
import com.estora.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyDto>>> getFavorites(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PropertyDto> favorites = favoriteService.getUserFavorites(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(favorites));
    }

    @GetMapping("/ids")
    public ResponseEntity<ApiResponse<List<Long>>> getFavoriteIds(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Long> ids = favoriteService.getUserFavoritePropertyIds(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(ids));
    }

    @PostMapping("/{propertyId}")
    public ResponseEntity<ApiResponse<Void>> addFavorite(
            @PathVariable Long propertyId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        favoriteService.addFavorite(userPrincipal.getId(), propertyId);
        return ResponseEntity.ok(ApiResponse.success("Property added to favorites", null));
    }

    @DeleteMapping("/{propertyId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Long propertyId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        favoriteService.removeFavorite(userPrincipal.getId(), propertyId);
        return ResponseEntity.ok(ApiResponse.success("Property removed from favorites", null));
    }
}
