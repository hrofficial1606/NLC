package com.nlc.backend.controller;

import com.nlc.backend.dto.booking.BookingResponse;
import com.nlc.backend.dto.booking.BookingReviewRequest;
import com.nlc.backend.dto.cms.AboutContentRequest;
import com.nlc.backend.dto.cms.AboutContentResponse;
import com.nlc.backend.dto.cms.TeamMemberRequest;
import com.nlc.backend.dto.cms.TeamMemberResponse;
import com.nlc.backend.dto.common.ApiResponse;
import com.nlc.backend.dto.common.PageResponse;
import com.nlc.backend.dto.contact.ContactInquiryResponse;
import com.nlc.backend.dto.dashboard.DashboardAnalyticsResponse;
import com.nlc.backend.dto.event.EventRequest;
import com.nlc.backend.dto.event.EventResponse;
import com.nlc.backend.dto.gallery.GalleryMediaRequest;
import com.nlc.backend.dto.gallery.GalleryMediaResponse;
import com.nlc.backend.dto.membercard.MemberCardRequest;
import com.nlc.backend.dto.membercard.MemberCardResponse;
import com.nlc.backend.dto.sponsor.SponsorRequest;
import com.nlc.backend.dto.sponsor.SponsorResponse;
import com.nlc.backend.dto.user.UserResponse;
import com.nlc.backend.entity.User;
import com.nlc.backend.repository.MemberCardRepository;
import com.nlc.backend.repository.UserRepository;
import com.nlc.backend.service.BookingService;
import com.nlc.backend.service.CmsService;
import com.nlc.backend.service.ContactService;
import com.nlc.backend.service.DashboardService;
import com.nlc.backend.service.EventService;
import com.nlc.backend.service.GalleryService;
import com.nlc.backend.service.MemberCardService;
import com.nlc.backend.service.SponsorService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.nlc.backend.security.UserPrincipal;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final EventService eventService;
    private final GalleryService galleryService;
    private final CmsService cmsService;
    private final ContactService contactService;
    private final DashboardService dashboardService;
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final SponsorService sponsorService;
    private final MemberCardService memberCardService;
    private final MemberCardRepository memberCardRepository;

    @GetMapping("/dashboard")
    public ApiResponse<DashboardAnalyticsResponse> dashboard() {
        return ApiResponse.success("Dashboard analytics fetched", dashboardService.getAnalytics());
    }

    @PostMapping("/events")
    public ApiResponse<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        return ApiResponse.success("Event created", eventService.create(request));
    }

    @PutMapping("/events/{id}")
    public ApiResponse<EventResponse> updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return ApiResponse.success("Event updated", eventService.update(id, request));
    }

    @DeleteMapping("/events/{id}")
    public ApiResponse<Void> deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
        return ApiResponse.success("Event deleted", null);
    }

    @GetMapping("/events")
    public ApiResponse<PageResponse<EventResponse>> adminEvents(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size,
                                                                @RequestParam(required = false) String search) {
        return ApiResponse.success("Admin events fetched", eventService.getAdminEvents(page, size, search));
    }

    @GetMapping("/users")
    public ApiResponse<List<UserResponse>> users() {
        List<UserResponse> result = userRepository.findAll().stream().map(this::toUserResponse).toList();
        return ApiResponse.success("Users fetched", result);
    }

    @PostMapping("/sponsors")
    public ApiResponse<SponsorResponse> createSponsor(@Valid @RequestBody SponsorRequest request) {
        return ApiResponse.success("Sponsor created", sponsorService.create(request));
    }

    @PutMapping("/sponsors/{id}")
    public ApiResponse<SponsorResponse> updateSponsor(@PathVariable Long id, @Valid @RequestBody SponsorRequest request) {
        return ApiResponse.success("Sponsor updated", sponsorService.update(id, request));
    }

    @DeleteMapping("/sponsors/{id}")
    public ApiResponse<Void> deleteSponsor(@PathVariable Long id) {
        sponsorService.delete(id);
        return ApiResponse.success("Sponsor deleted", null);
    }

    @GetMapping("/sponsors")
    public ApiResponse<List<SponsorResponse>> sponsors() {
        return ApiResponse.success("Sponsors fetched", sponsorService.getAdminSponsors());
    }

    @PatchMapping("/users/{id}/block")
    public ApiResponse<Void> blockUser(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setBlocked(true);
            userRepository.save(user);
        });
        return ApiResponse.success("User blocked", null);
    }

    @PatchMapping("/users/{id}/unblock")
    public ApiResponse<Void> unblockUser(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setBlocked(false);
            userRepository.save(user);
        });
        return ApiResponse.success("User unblocked", null);
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ApiResponse.success("User deleted", null);
    }

    @GetMapping("/bookings")
    public ApiResponse<List<BookingResponse>> bookings(@RequestParam(required = false) String status) {
        return ApiResponse.success("Bookings fetched", bookingService.getAllBookings(status));
    }

    @PatchMapping("/bookings/{id}/approve")
    public ApiResponse<BookingResponse> approveBooking(@PathVariable Long id,
                                                       @AuthenticationPrincipal UserPrincipal principal,
                                                       @RequestBody(required = false) BookingReviewRequest request) {
        return ApiResponse.success("Registration approved",
                bookingService.approveBooking(id, principal.getId(), request));
    }

    @PatchMapping("/bookings/{id}/reject")
    public ApiResponse<BookingResponse> rejectBooking(@PathVariable Long id,
                                                      @AuthenticationPrincipal UserPrincipal principal,
                                                      @Valid @RequestBody BookingReviewRequest request) {
        return ApiResponse.success("Registration rejected",
                bookingService.rejectBooking(id, principal.getId(), request));
    }

    @PostMapping("/gallery")
    public ApiResponse<GalleryMediaResponse> createGalleryItem(@Valid @RequestBody GalleryMediaRequest request) {
        return ApiResponse.success("Gallery item created", galleryService.create(request));
    }

    @PutMapping("/gallery/{id}")
    public ApiResponse<GalleryMediaResponse> updateGalleryItem(@PathVariable Long id,
                                                               @Valid @RequestBody GalleryMediaRequest request) {
        return ApiResponse.success("Gallery item updated", galleryService.update(id, request));
    }

    @DeleteMapping("/gallery/{id}")
    public ApiResponse<Void> deleteGalleryItem(@PathVariable Long id) {
        galleryService.delete(id);
        return ApiResponse.success("Gallery item deleted", null);
    }

    @GetMapping("/gallery")
    public ApiResponse<PageResponse<GalleryMediaResponse>> gallery(@RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success("Gallery fetched", galleryService.list(page, size));
    }

    @PostMapping("/team")
    public ApiResponse<TeamMemberResponse> createTeamMember(@Valid @RequestBody TeamMemberRequest request) {
        return ApiResponse.success("Team member created", cmsService.createTeamMember(request));
    }

    @PutMapping("/team/{id}")
    public ApiResponse<TeamMemberResponse> updateTeamMember(@PathVariable Long id,
                                                            @Valid @RequestBody TeamMemberRequest request) {
        return ApiResponse.success("Team member updated", cmsService.updateTeamMember(id, request));
    }

    @DeleteMapping("/team/{id}")
    public ApiResponse<Void> deleteTeamMember(@PathVariable Long id) {
        cmsService.deleteTeamMember(id);
        return ApiResponse.success("Team member deleted", null);
    }

    @GetMapping("/team")
    public ApiResponse<List<TeamMemberResponse>> teamMembers() {
        return ApiResponse.success("Team members fetched", cmsService.getTeamMembers());
    }

    @PostMapping("/about-content")
    public ApiResponse<AboutContentResponse> saveAboutContent(@Valid @RequestBody AboutContentRequest request) {
        return ApiResponse.success("About content saved", cmsService.saveAboutContent(request));
    }

    @GetMapping("/about-content")
    public ApiResponse<List<AboutContentResponse>> aboutContent() {
        return ApiResponse.success("About content fetched", cmsService.getAboutContent());
    }

    @GetMapping("/contact-inquiries")
    public ApiResponse<List<ContactInquiryResponse>> contactInquiries() {
        return ApiResponse.success("Contact inquiries fetched", contactService.getAll());
    }

    @PatchMapping("/contact-inquiries/{id}/resolve")
    public ApiResponse<Void> resolveInquiry(@PathVariable Long id) {
        contactService.markResolved(id);
        return ApiResponse.success("Inquiry marked resolved", null);
    }

    @PostMapping("/member-cards")
    public ApiResponse<MemberCardResponse> issueMemberCard(@Valid @RequestBody MemberCardRequest request) {
        return ApiResponse.success("Member card issued", memberCardService.issueCard(request));
    }

    @PutMapping("/member-cards/{id}")
    public ApiResponse<MemberCardResponse> updateMemberCard(@PathVariable Long id,
                                                            @Valid @RequestBody MemberCardRequest request) {
        return ApiResponse.success("Member card updated", memberCardService.updateCard(id, request));
    }

    @GetMapping("/member-cards")
    public ApiResponse<List<MemberCardResponse>> memberCards() {
        return ApiResponse.success("Member cards fetched", memberCardService.getAllCards());
    }

    @GetMapping("/member-cards/user/{userId}")
    public ApiResponse<MemberCardResponse> memberCardByUser(@PathVariable Long userId) {
        return ApiResponse.success("Member card fetched", memberCardService.getCardByUserId(userId));
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getCity(),
                user.getProfession(),
                user.isBlocked(),
                user.isEmailVerified(),
                memberCardRepository.findByUserId(user.getId()).isPresent(),
                user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()),
                user.getCreatedAt()
        );
    }
}
