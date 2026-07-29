package com.nlc.backend.service.impl;

import com.nlc.backend.entity.InstagramSyncConfig;
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

    @Override
    public void syncLatestPosts() {
        InstagramSyncConfig config = instagramSyncConfigRepository.findAll().stream().findFirst().orElse(null);
        if (config == null || !config.isEnabled()) {
            return;
        }

        config.setLastSyncedAt(LocalDateTime.now());
        instagramSyncConfigRepository.save(config);
        log.warn("Instagram sync is enabled but real Graph API fetch logic still needs valid credentials and API implementation.");
    }
}
