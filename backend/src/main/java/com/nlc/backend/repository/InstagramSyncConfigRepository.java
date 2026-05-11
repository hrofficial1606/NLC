package com.nlc.backend.repository;

import com.nlc.backend.entity.InstagramSyncConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstagramSyncConfigRepository extends JpaRepository<InstagramSyncConfig, Long> {
}
