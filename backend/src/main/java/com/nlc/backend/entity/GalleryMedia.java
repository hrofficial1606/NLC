package com.nlc.backend.entity;

import com.nlc.backend.entity.base.AuditableEntity;
import com.nlc.backend.entity.enums.MediaSourceType;
import com.nlc.backend.entity.enums.MediaType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "gallery_media")
public class GalleryMedia extends AuditableEntity {

    @Column(nullable = false, length = 160)
    private String title;

    @Column(length = 180)
    private String category;

    @Column(nullable = false, length = 500)
    private String mediaUrl;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(length = 180)
    private String externalMediaId;

    /**
     * Public identifier of the underlying object in the configured storage
     * provider. For Cloudinary this is the Cloudinary {@code public_id} (used
     * to safely replace or delete the asset). For Supabase it's the object
     * key. Null when the admin provided a manual external URL.
     *
     * <p>Nullable so existing rows with manual URLs / legacy Supabase URLs
     * continue to work without backfill.
     */
    @Column(length = 500)
    private String storagePublicId;

    /**
     * Identifies which storage provider owns the asset, so delete can be
     * safely routed (CLOUDINARY, SUPABASE, or null for external URLs).
     * Nullable for backward compatibility with existing rows.
     */
    @Column(length = 32)
    private String storageProvider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MediaType mediaType = MediaType.IMAGE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MediaSourceType sourceType = MediaSourceType.MANUAL_UPLOAD;

    @Column(nullable = false)
    private boolean active = true;
}
