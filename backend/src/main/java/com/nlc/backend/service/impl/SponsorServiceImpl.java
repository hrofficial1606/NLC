package com.nlc.backend.service.impl;

import com.nlc.backend.dto.sponsor.SponsorRequest;
import com.nlc.backend.dto.sponsor.SponsorResponse;
import com.nlc.backend.entity.Sponsor;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.SponsorRepository;
import com.nlc.backend.service.SponsorService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SponsorServiceImpl implements SponsorService {

    private final SponsorRepository sponsorRepository;

    @Override
    @Transactional
    public SponsorResponse create(SponsorRequest request) {
        if (sponsorRepository.existsBySlugIgnoreCase(request.slug())) {
            throw new BadRequestException("Sponsor slug already exists");
        }
        Sponsor sponsor = new Sponsor();
        apply(sponsor, request);
        return toResponse(sponsorRepository.save(sponsor));
    }

    @Override
    @Transactional
    public SponsorResponse update(Long id, SponsorRequest request) {
        Sponsor sponsor = sponsorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sponsor not found"));
        boolean slugChanged = !sponsor.getSlug().equalsIgnoreCase(request.slug());
        if (slugChanged && sponsorRepository.existsBySlugIgnoreCase(request.slug())) {
            throw new BadRequestException("Sponsor slug already exists");
        }
        apply(sponsor, request);
        return toResponse(sponsorRepository.save(sponsor));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        sponsorRepository.deleteById(id);
    }

    @Override
    public List<SponsorResponse> getPublicSponsors() {
        return sponsorRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc().stream().map(this::toResponse).toList();
    }

    @Override
    public List<SponsorResponse> getAdminSponsors() {
        return sponsorRepository.findAllByOrderByDisplayOrderAscNameAsc().stream().map(this::toResponse).toList();
    }

    private void apply(Sponsor sponsor, SponsorRequest request) {
        sponsor.setName(request.name());
        sponsor.setSlug(request.slug().trim().toLowerCase());
        sponsor.setLogoUrl(request.logoUrl());
        sponsor.setWebsiteUrl(request.websiteUrl());
        sponsor.setCategory(request.category());
        sponsor.setDescription(request.description());
        sponsor.setDisplayOrder(request.displayOrder());
        sponsor.setActive(request.active());
    }

    private SponsorResponse toResponse(Sponsor sponsor) {
        return new SponsorResponse(
                sponsor.getId(),
                sponsor.getName(),
                sponsor.getSlug(),
                sponsor.getLogoUrl(),
                sponsor.getWebsiteUrl(),
                sponsor.getCategory(),
                sponsor.getDescription(),
                sponsor.getDisplayOrder(),
                sponsor.isActive(),
                sponsor.getCreatedAt()
        );
    }
}
