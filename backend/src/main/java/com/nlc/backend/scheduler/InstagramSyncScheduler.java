package com.nlc.backend.scheduler;

import com.nlc.backend.service.InstagramSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InstagramSyncScheduler {

    private final InstagramSyncService instagramSyncService;

    @Scheduled(cron = "${app.integrations.instagram.sync-cron}")
    public void syncInstagramContent() {
        instagramSyncService.syncLatestPosts();
    }
}
