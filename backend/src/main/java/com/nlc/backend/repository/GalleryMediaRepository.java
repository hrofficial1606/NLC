package com.nlc.backend.repository;

import com.nlc.backend.entity.GalleryMedia;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GalleryMediaRepository extends JpaRepository<GalleryMedia, Long> {
    Optional<GalleryMedia> findByExternalMediaId(String externalMediaId);
}
