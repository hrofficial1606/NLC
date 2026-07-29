package com.nlc.backend.repository;

import com.nlc.backend.entity.MemberCard;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberCardRepository extends JpaRepository<MemberCard, Long> {
    Optional<MemberCard> findByUserId(Long userId);
    List<MemberCard> findAllByOrderByCreatedAtDesc();
}
