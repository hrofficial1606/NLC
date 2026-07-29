package com.nlc.backend.service;

import com.nlc.backend.dto.sponsor.SponsorRequest;
import com.nlc.backend.dto.sponsor.SponsorResponse;
import java.util.List;

public interface SponsorService {
    SponsorResponse create(SponsorRequest request);
    SponsorResponse update(Long id, SponsorRequest request);
    void delete(Long id);
    List<SponsorResponse> getPublicSponsors();
    List<SponsorResponse> getAdminSponsors();
}
