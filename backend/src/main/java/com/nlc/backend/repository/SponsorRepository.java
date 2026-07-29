package com.nlc.backend.repository;

import com.nlc.backend.entity.Sponsor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SponsorRepository extends JpaRepository<Sponsor, Long> {
    List<Sponsor> findByActiveTrueOrderByDisplayOrderAscNameAsc();
    List<Sponsor> findAllByOrderByDisplayOrderAscNameAsc();
    boolean existsBySlugIgnoreCase(String slug);
}
