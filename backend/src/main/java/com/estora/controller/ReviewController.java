package com.estora.controller;

import com.estora.dto.ApiResponse;
import com.estora.dto.ReviewDto;
import com.estora.security.UserPrincipal;
import com.estora.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents/{agentId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Agent Reviews", description = "Endpoints for reviewing real estate agents and advisory teams")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get reviews for an agent", description = "Retrieves all public reviews and ratings submitted for a specific agent")
    public ResponseEntity<List<ReviewDto>> getAgentReviews(@PathVariable Long agentId) {
        return ResponseEntity.ok(reviewService.getReviewsForAgent(agentId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Submit a review for an agent", description = "Allows authenticated users to submit a 1-5 star rating and feedback comment for an agent")
    public ResponseEntity<ReviewDto> submitReview(
            @PathVariable Long agentId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ReviewDto reviewDto
    ) {
        ReviewDto createdReview = reviewService.createReview(currentUser.getId(), agentId, reviewDto);
        return new ResponseEntity<>(createdReview, HttpStatus.CREATED);
    }
}
