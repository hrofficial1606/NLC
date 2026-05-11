package com.nlc.backend.repository;

import com.nlc.backend.entity.AboutContent;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AboutContentRepository extends JpaRepository<AboutContent, Long> {
    List<AboutContent> findByActiveTrueOrderByCreatedAtAsc();
    Optional<AboutContent> findBySectionKey(String sectionKey);
}
