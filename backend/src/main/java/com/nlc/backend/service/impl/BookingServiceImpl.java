package com.nlc.backend.service.impl;

import com.nlc.backend.dto.booking.BookingRequest;
import com.nlc.backend.dto.booking.BookingResponse;
import com.nlc.backend.entity.Booking;
import com.nlc.backend.entity.Event;
import com.nlc.backend.entity.User;
import com.nlc.backend.entity.enums.BookingStatus;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.BookingRepository;
import com.nlc.backend.repository.EventRepository;
import com.nlc.backend.repository.UserRepository;
import com.nlc.backend.service.BookingService;
import com.nlc.backend.service.EmailService;
import com.nlc.backend.util.QrCodeUtil;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (event.getAvailableSeats() < request.quantity()) {
            throw new BadRequestException("Not enough seats available");
        }

        Booking booking = new Booking();
        booking.setBookingReference("NLC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(request.quantity());
        booking.setTotalAmount(event.getTicketPrice().multiply(BigDecimal.valueOf(request.quantity())));
        booking.setStatus(BookingStatus.PENDING);
        booking.setAttendeeNotes(request.attendeeNotes());
        booking.setQrCodeUrl(QrCodeUtil.generateDataUri(booking.getBookingReference()));

        event.setAvailableSeats(event.getAvailableSeats() - request.quantity());
        Booking saved = bookingRepository.save(booking);
        eventRepository.save(event);

        emailService.sendBookingConfirmation(user.getEmail(), saved.getBookingReference(), saved.getQrCodeUrl());
        return toResponse(saved);
    }

    @Override
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toResponse).toList();
    }

    private BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getBookingReference(),
                booking.getEvent().getId(),
                booking.getEvent().getTitle(),
                booking.getQuantity(),
                booking.getTotalAmount(),
                booking.getStatus().name(),
                booking.getQrCodeUrl(),
                booking.getCreatedAt()
        );
    }
}
