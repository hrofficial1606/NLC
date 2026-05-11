package com.nlc.backend.service.impl;

import com.nlc.backend.entity.GalleryMedia;
import com.nlc.backend.entity.InstagramSyncConfig;
import com.nlc.backend.entity.enums.MediaSourceType;
import com.nlc.backend.entity.enums.MediaType;
import com.nlc.backend.repository.GalleryMediaRepository;
import com.nlc.backend.repository.InstagramSyncConfigRepository;
import com.nlc.backend.service.InstagramSyncService;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class InstagramSyncServiceImpl implements InstagramSyncService {

    private final InstagramSyncConfigRepository instagramSyncConfigRepository;
    private final GalleryMediaRepository galleryMediaRepository;

    @Override
    public void syncLatestPosts() {
        InstagramSyncConfig config = instagramSyncConfigRepository.findAll().stream().findFirst().orElse(null);
        if (config == null || !config.isEnabled()) {
            return;
        }

        // Placeholder for Graph API fetch. Keep persistence hook ready for real integration.
        galleryMediaRepository.findByExternalMediaId("sample-instagram-post").orElseGet(() -> {
            GalleryMedia media = new GalleryMedia();
            media.setTitle("Instagram Synced Sample");
            media.setCategory("instagram");
            media.setMediaUrl("https://instagram.com");
            media.setThumbnailUrl("https://instagram.com");
            media.setExternalMediaId("sample-instagram-post");
            media.setMediaType(MediaType.IMAGE);
            media.setSourceType(MediaSourceType.INSTAGRAM_SYNC);
            return galleryMediaRepository.save(media);
        });

        config.setLastSyncedAt(LocalDateTime.now());
        instagramSyncConfigRepository.save(config);
        log.info("Instagram sync completed");
    }
}
