package com.nlc.backend.service.impl;

import com.nlc.backend.dto.common.PageResponse;
import com.nlc.backend.dto.event.EventRequest;
import com.nlc.backend.dto.event.EventResponse;
import com.nlc.backend.entity.Event;
import com.nlc.backend.entity.enums.BookingStatus;
import com.nlc.backend.entity.enums.EventStatus;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.EventRepository;
import com.nlc.backend.service.EventService;
import java.time.LocalDateTime;
import com.nlc.backend.util.PageMapper;
import com.nlc.backend.util.SlugUtil;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    @Override
    public EventResponse create(EventRequest request) {
        Event event = new Event();
        apply(request, event);
        enforceSingleFeaturedEvent(event);
        event.setAvailableSeats(request.totalSeats());
        return toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse update(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        apply(request, event);
        enforceSingleFeaturedEvent(event);
        return toResponse(eventRepository.save(event));
    }

    @Override
    public void delete(Long id) {
        eventRepository.deleteById(id);
    }

    @Override
    public EventResponse getById(Long id) {
        return eventRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    @Override
    public EventResponse getUpcomingHighlight() {
        LocalDateTime now = LocalDateTime.now();
        Event event = eventRepository
                .findFirstByFeaturedTrueAndStatusAndAvailableTrueAndEventDateAfterOrderByEventDateAsc(
                        EventStatus.PUBLISHED, now)
                .or(() -> eventRepository.findFirstByStatusAndAvailableTrueAndEventDateAfterOrderByEventDateAsc(
                        EventStatus.PUBLISHED, now))
                .orElseThrow(() -> new ResourceNotFoundException("Upcoming event not found"));
        return toResponse(event);
    }

    @Override
    public PageResponse<EventResponse> getPublicEvents(int page, int size, String search) {
        Page<Event> eventPage = search == null || search.isBlank()
                ? eventRepository.findByStatusAndAvailableTrue(EventStatus.PUBLISHED, PageRequest.of(page, size))
                : eventRepository.findByTitleContainingIgnoreCase(search, PageRequest.of(page, size));
        return PageMapper.toResponse(eventPage, this::toResponse);
    }

    @Override
    public PageResponse<EventResponse> getAdminEvents(int page, int size, String search) {
        Page<Event> eventPage = search == null || search.isBlank()
                ? eventRepository.findAll(PageRequest.of(page, size))
                : eventRepository.findByTitleContainingIgnoreCase(search, PageRequest.of(page, size));
        return PageMapper.toResponse(eventPage, this::toResponse);
    }

    private void apply(EventRequest request, Event event) {
        event.setTitle(request.title());
        event.setSlug(SlugUtil.toSlug(request.slug()));
        event.setDescription(request.description());
        event.setShortDescription(request.shortDescription());
        event.setEventDate(request.eventDate());
        event.setLocation(request.location());
        event.setTicketPrice(request.ticketPrice());
        event.setTotalSeats(request.totalSeats());
        event.setRegistrationEnabled(request.registrationEnabled());
        event.setPaidEvent(request.paidEvent());
        event.setAvailable(request.available());
        event.setFeatured(request.featured());
        event.setBannerImageUrl(request.bannerImageUrl());
        event.setQrImageUrl(request.qrImageUrl());
        event.setUpiId(request.upiId());
        event.setPaymentInstructions(request.paymentInstructions());
        event.setRegistrationDeadline(request.registrationDeadline());
        event.setStatus(EventStatus.valueOf(request.status().toUpperCase(Locale.ROOT)));
        int approvedSeats = event.getBookings() == null ? 0 : event.getBookings().stream()
                .filter(booking -> booking.getStatus() == BookingStatus.APPROVED)
                .mapToInt(booking -> booking.getQuantity() == null ? 0 : booking.getQuantity())
                .sum();
        event.setAvailableSeats(Math.max(0, request.totalSeats() - approvedSeats));
    }

    private void enforceSingleFeaturedEvent(Event currentEvent) {
        if (!currentEvent.isFeatured()) {
            return;
        }
        eventRepository.findByFeaturedTrue().stream()
                .filter(savedEvent -> currentEvent.getId() == null || !savedEvent.getId().equals(currentEvent.getId()))
                .forEach(savedEvent -> {
                    savedEvent.setFeatured(false);
                    eventRepository.save(savedEvent);
                });
    }

    private EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getSlug(),
                event.getDescription(),
                event.getShortDescription(),
                event.getEventDate(),
                event.getLocation(),
                event.getTicketPrice(),
                event.getTotalSeats(),
                event.getAvailableSeats(),
                event.isRegistrationEnabled(),
                event.isPaidEvent(),
                event.isFeatured(),
                event.isAvailable(),
                event.getBannerImageUrl(),
                event.getQrImageUrl(),
                event.getUpiId(),
                event.getPaymentInstructions(),
                event.getRegistrationDeadline(),
                event.getStatus().name()
        );
    }
}
