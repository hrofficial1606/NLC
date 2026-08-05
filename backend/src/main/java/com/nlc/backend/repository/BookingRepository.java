package com.nlc.backend.repository;

import com.nlc.backend.entity.Booking;
import com.nlc.backend.entity.enums.BookingStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    Optional<Booking> findByUserIdAndEventId(Long userId, Long eventId);

    long countByStatus(BookingStatus status);
}
