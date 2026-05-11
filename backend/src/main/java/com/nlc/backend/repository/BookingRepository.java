package com.nlc.backend.repository;

import com.nlc.backend.entity.Booking;
import com.nlc.backend.entity.enums.BookingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByStatus(BookingStatus status);
}
