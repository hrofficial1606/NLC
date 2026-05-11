package com.nlc.backend.service.impl;

import com.nlc.backend.dto.cms.AboutContentRequest;
import com.nlc.backend.dto.cms.AboutContentResponse;
import com.nlc.backend.dto.cms.TeamMemberRequest;
import com.nlc.backend.dto.cms.TeamMemberResponse;
import com.nlc.backend.entity.AboutContent;
import com.nlc.backend.entity.TeamMember;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.AboutContentRepository;
import com.nlc.backend.repository.TeamMemberRepository;
import com.nlc.backend.service.CmsService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CmsServiceImpl implements CmsService {

    private final TeamMemberRepository teamMemberRepository;
    private final AboutContentRepository aboutContentRepository;

    @Override
    public TeamMemberResponse createTeamMember(TeamMemberRequest request) {
        TeamMember member = new TeamMember();
        apply(request, member);
        return toResponse(teamMemberRepository.save(member));
    }

    @Override
    public TeamMemberResponse updateTeamMember(Long id, TeamMemberRequest request) {
        TeamMember member = teamMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team member not found"));
        apply(request, member);
        return toResponse(teamMemberRepository.save(member));
    }

    @Override
    public void deleteTeamMember(Long id) {
        teamMemberRepository.deleteById(id);
    }

    @Override
    public List<TeamMemberResponse> getTeamMembers() {
        return teamMemberRepository.findAllByOrderByDisplayOrderAsc().stream().map(this::toResponse).toList();
    }

    @Override
    public AboutContentResponse saveAboutContent(AboutContentRequest request) {
        AboutContent content = aboutContentRepository.findBySectionKey(request.sectionKey()).orElse(new AboutContent());
        content.setSectionKey(request.sectionKey());
        content.setTitle(request.title());
        content.setContent(request.content());
        content.setImageUrl(request.imageUrl());
        content.setActive(request.active());
        return toResponse(aboutContentRepository.save(content));
    }

    @Override
    public List<AboutContentResponse> getAboutContent() {
        return aboutContentRepository.findByActiveTrueOrderByCreatedAtAsc().stream().map(this::toResponse).toList();
    }

    private void apply(TeamMemberRequest request, TeamMember member) {
        member.setName(request.name());
        member.setDesignation(request.designation());
        member.setBio(request.bio());
        member.setImageUrl(request.imageUrl());
        member.setInstagramUrl(request.instagramUrl());
        member.setFacebookUrl(request.facebookUrl());
        member.setLinkedinUrl(request.linkedinUrl());
        member.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
    }

    private TeamMemberResponse toResponse(TeamMember member) {
        return new TeamMemberResponse(
                member.getId(),
                member.getName(),
                member.getDesignation(),
                member.getBio(),
                member.getImageUrl(),
                member.getInstagramUrl(),
                member.getFacebookUrl(),
                member.getLinkedinUrl(),
                member.getDisplayOrder()
        );
    }

    private AboutContentResponse toResponse(AboutContent content) {
        return new AboutContentResponse(
                content.getId(),
                content.getSectionKey(),
                content.getTitle(),
                content.getContent(),
                content.getImageUrl(),
                content.isActive()
        );
    }
}
