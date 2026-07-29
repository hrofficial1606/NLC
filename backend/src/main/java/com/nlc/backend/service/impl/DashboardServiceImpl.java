package com.nlc.backend.service.impl;

import com.nlc.backend.dto.dashboard.DashboardAnalyticsResponse;
import com.nlc.backend.entity.enums.BookingStatus;
import com.nlc.backend.entity.enums.EventStatus;
import com.nlc.backend.entity.enums.InquiryStatus;
import com.nlc.backend.repository.BookingRepository;
import com.nlc.backend.repository.ContactInquiryRepository;
import com.nlc.backend.repository.EventRepository;
import com.nlc.backend.repository.GalleryMediaRepository;
import com.nlc.backend.repository.MemberCardRepository;
import com.nlc.backend.repository.UserRepository;
import com.nlc.backend.service.DashboardService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final ContactInquiryRepository contactInquiryRepository;
    private final MemberCardRepository memberCardRepository;
    private final GalleryMediaRepository galleryMediaRepository;

    @Override
    public DashboardAnalyticsResponse getAnalytics() {
        BigDecimal revenue = bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == BookingStatus.APPROVED)
                .map(booking -> booking.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long upcomingEvents = eventRepository.findByStatusAndAvailableTrue(EventStatus.PUBLISHED,
                org.springframework.data.domain.PageRequest.of(0, 200)).stream()
                .filter(event -> event.getEventDate().isAfter(LocalDateTime.now()))
                .count();

        return new DashboardAnalyticsResponse(
                userRepository.count(),
                eventRepository.count(),
                upcomingEvents,
                bookingRepository.count(),
                bookingRepository.countByStatus(BookingStatus.PENDING),
                bookingRepository.countByStatus(BookingStatus.APPROVED),
                bookingRepository.countByStatus(BookingStatus.REJECTED),
                memberCardRepository.count(),
                galleryMediaRepository.count(),
                revenue,
                contactInquiryRepository.countByStatus(InquiryStatus.OPEN)
        );
    }
}
