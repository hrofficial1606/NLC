package com.nlc.backend.service;

import com.nlc.backend.dto.common.PageResponse;
import com.nlc.backend.dto.event.EventRequest;
import com.nlc.backend.dto.event.EventResponse;

public interface EventService {
    EventResponse create(EventRequest request);
    EventResponse update(Long id, EventRequest request);
    void delete(Long id);
    EventResponse getById(Long id);
    PageResponse<EventResponse> getPublicEvents(int page, int size, String search);
    PageResponse<EventResponse> getAdminEvents(int page, int size, String search);
}
