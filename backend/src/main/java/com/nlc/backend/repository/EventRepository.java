package com.nlc.backend.repository;

import com.nlc.backend.entity.Event;
import com.nlc.backend.entity.enums.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByStatusAndAvailableTrue(EventStatus status, Pageable pageable);
    Page<Event> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
    long countByFeaturedTrue();
}
