package com.estora.service;

import com.estora.dto.ReviewDto;
import com.estora.entity.Review;
import com.estora.entity.Role;
import com.estora.entity.User;
import com.estora.exception.BadRequestException;
import com.estora.exception.ResourceNotFoundException;
import com.estora.repository.ReviewRepository;
import com.estora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewDto createReview(Long userId, Long agentId, ReviewDto reviewDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        if (agent.getRole() != Role.AGENT && agent.getRole() != Role.ADMIN) {
            throw new BadRequestException("Reviews can only be submitted for verified Agents or Admins");
        }

        if (user.getId().equals(agent.getId())) {
            throw new BadRequestException("You cannot submit a review for yourself");
        }

        Review review = Review.builder()
                .user(user)
                .agent(agent)
                .rating(reviewDto.getRating())
                .comment(reviewDto.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToDto(savedReview);
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsForAgent(Long agentId) {
        return reviewRepository.findByAgentIdOrderByCreatedAtDesc(agentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ReviewDto mapToDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .userAvatar(review.getUser().getAvatarUrl())
                .agentId(review.getAgent().getId())
                .agentName(review.getAgent().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
