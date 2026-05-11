package com.nlc.backend.service.impl;

import com.nlc.backend.dto.dashboard.DashboardAnalyticsResponse;
import com.nlc.backend.entity.enums.BookingStatus;
import com.nlc.backend.entity.enums.InquiryStatus;
import com.nlc.backend.repository.BookingRepository;
import com.nlc.backend.repository.ContactInquiryRepository;
import com.nlc.backend.repository.EventRepository;
import com.nlc.backend.repository.PaymentTransactionRepository;
import com.nlc.backend.repository.UserRepository;
import com.nlc.backend.service.DashboardService;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final EventRepository eventRepository;
    private final ContactInquiryRepository contactInquiryRepository;

    @Override
    public DashboardAnalyticsResponse getAnalytics() {
        BigDecimal revenue = paymentTransactionRepository.findAll().stream()
                .map(transaction -> transaction.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardAnalyticsResponse(
                userRepository.count(),
                bookingRepository.countByStatus(BookingStatus.CONFIRMED),
                revenue,
                eventRepository.countByFeaturedTrue(),
                contactInquiryRepository.countByStatus(InquiryStatus.OPEN)
        );
    }
}
