package com.nlc.backend.service;

import com.nlc.backend.dto.cms.AboutContentRequest;
import com.nlc.backend.dto.cms.AboutContentResponse;
import com.nlc.backend.dto.cms.TeamMemberRequest;
import com.nlc.backend.dto.cms.TeamMemberResponse;
import java.util.List;

public interface CmsService {
    TeamMemberResponse createTeamMember(TeamMemberRequest request);
    TeamMemberResponse updateTeamMember(Long id, TeamMemberRequest request);
    void deleteTeamMember(Long id);
    List<TeamMemberResponse> getTeamMembers();
    AboutContentResponse saveAboutContent(AboutContentRequest request);
    List<AboutContentResponse> getAboutContent();
}
