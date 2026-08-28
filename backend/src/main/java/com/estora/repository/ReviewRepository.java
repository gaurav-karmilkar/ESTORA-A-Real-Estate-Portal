package com.estora.repository;

import com.estora.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByAgentIdOrderByCreatedAtDesc(Long agentId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.agent.id = :agentId")
    Double calculateAverageRatingForAgent(@Param("agentId") Long agentId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.agent.id = :agentId")
    Long countReviewsForAgent(@Param("agentId") Long agentId);
}
