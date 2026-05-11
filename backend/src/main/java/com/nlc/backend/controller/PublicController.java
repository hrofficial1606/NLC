package com.nlc.backend.controller;

import com.nlc.backend.dto.cms.AboutContentResponse;
import com.nlc.backend.dto.cms.TeamMemberResponse;
import com.nlc.backend.dto.common.ApiResponse;
import com.nlc.backend.dto.common.PageResponse;
import com.nlc.backend.dto.contact.ContactInquiryRequest;
import com.nlc.backend.dto.contact.ContactInquiryResponse;
import com.nlc.backend.dto.event.EventResponse;
import com.nlc.backend.dto.gallery.GalleryMediaResponse;
import com.nlc.backend.service.CmsService;
import com.nlc.backend.service.ContactService;
import com.nlc.backend.service.EventService;
import com.nlc.backend.service.GalleryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final EventService eventService;
    private final GalleryService galleryService;
    private final CmsService cmsService;
    private final ContactService contactService;

    @GetMapping("/events")
    public ApiResponse<PageResponse<EventResponse>> events(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        return ApiResponse.success("Events fetched", eventService.getPublicEvents(page, size, search));
    }

    @GetMapping("/events/{id}")
    public ApiResponse<EventResponse> eventDetails(@PathVariable Long id) {
        return ApiResponse.success("Event fetched", eventService.getById(id));
    }

    @GetMapping("/gallery")
    public ApiResponse<PageResponse<GalleryMediaResponse>> gallery(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ApiResponse.success("Gallery fetched", galleryService.list(page, size));
    }

    @GetMapping("/about/content")
    public ApiResponse<List<AboutContentResponse>> aboutContent() {
        return ApiResponse.success("About content fetched", cmsService.getAboutContent());
    }

    @GetMapping("/about/team")
    public ApiResponse<List<TeamMemberResponse>> teamMembers() {
        return ApiResponse.success("Team members fetched", cmsService.getTeamMembers());
    }

    @PostMapping("/contact")
    public ApiResponse<ContactInquiryResponse> contact(@Valid @RequestBody ContactInquiryRequest request) {
        return ApiResponse.success("Inquiry submitted successfully", contactService.create(request));
    }
}
