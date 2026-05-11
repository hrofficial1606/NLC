package com.nlc.backend.service.impl;

import com.nlc.backend.dto.common.PageResponse;
import com.nlc.backend.dto.event.EventRequest;
import com.nlc.backend.dto.event.EventResponse;
import com.nlc.backend.entity.Event;
import com.nlc.backend.entity.enums.EventStatus;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.EventRepository;
import com.nlc.backend.service.EventService;
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
        event.setAvailableSeats(request.totalSeats());
        return toResponse(eventRepository.save(event));
    }

    @Override
    public EventResponse update(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        apply(request, event);
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
        event.setAvailable(request.available());
        event.setFeatured(request.featured());
        event.setBannerImageUrl(request.bannerImageUrl());
        event.setStatus(EventStatus.valueOf(request.status().toUpperCase(Locale.ROOT)));
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
                event.isFeatured(),
                event.isAvailable(),
                event.getBannerImageUrl(),
                event.getStatus().name()
        );
    }
}
