package com.nlc.backend.service.impl;

import com.nlc.backend.dto.common.PageResponse;
import com.nlc.backend.dto.gallery.GalleryMediaRequest;
import com.nlc.backend.dto.gallery.GalleryMediaResponse;
import com.nlc.backend.entity.GalleryMedia;
import com.nlc.backend.entity.enums.MediaSourceType;
import com.nlc.backend.entity.enums.MediaType;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.GalleryMediaRepository;
import com.nlc.backend.service.GalleryService;
import com.nlc.backend.service.MediaStorageService;
import com.nlc.backend.util.PageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GalleryServiceImpl implements GalleryService {

    /** Provider keys stored on GalleryMedia rows that own the underlying asset. */
    private static final String PROVIDER_CLOUDINARY = "CLOUDINARY";
    private static final String PROVIDER_SUPABASE = "SUPABASE";

    private final GalleryMediaRepository galleryMediaRepository;
    /**
     * Optional — only present when the active public-storage provider is
     * Supabase OR Cloudinary. Used to safely delete the underlying asset
     * when the gallery row is removed. Injected lazily via a setter pattern
     * is unnecessary because Spring autowires by type and MediaStorageService
     * has a single active bean at any time.
     */
    private final MediaStorageService mediaStorageService;

    @Override
    public GalleryMediaResponse create(GalleryMediaRequest request) {
        GalleryMedia media = new GalleryMedia();
        apply(request, media);
        media.setSourceType(MediaSourceType.MANUAL_UPLOAD);
        return toResponse(galleryMediaRepository.save(media));
    }

    @Override
    public GalleryMediaResponse update(Long id, GalleryMediaRequest request) {
        GalleryMedia media = galleryMediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found"));
        apply(request, media);
        return toResponse(galleryMediaRepository.save(media));
    }

    @Override
    public void delete(Long id) {
        GalleryMedia media = galleryMediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found"));
        deleteOwnedAsset(media);
        galleryMediaRepository.delete(media);
    }

    @Override
    public PageResponse<GalleryMediaResponse> list(int page, int size) {
        return PageMapper.toResponse(galleryMediaRepository.findAll(PageRequest.of(page, size)), this::toResponse);
    }

    /**
     * If the gallery row was created from a Cloudinary (or Supabase) upload
     * AND we still have a non-empty {@code storagePublicId} AND the storage
     * provider bean is wired in, attempt to delete the underlying object.
     *
     * <p>Never deletes a manual external URL — those have no ownership on the
     * configured provider. Failures are logged but never break the DB delete;
     * the row is the source of truth, the asset is best-effort cleanup.
     */
    private void deleteOwnedAsset(GalleryMedia media) {
        String provider = media.getStorageProvider();
        String publicId = media.getStoragePublicId();
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        if (!PROVIDER_CLOUDINARY.equalsIgnoreCase(provider) && !PROVIDER_SUPABASE.equalsIgnoreCase(provider)) {
            // Manual/external URL — no ownership of an underlying asset.
            return;
        }
        if (mediaStorageService == null) {
            log.debug("MediaStorageService bean not present; skipping asset delete for media {}", media.getId());
            return;
        }
        try {
            mediaStorageService.delete(publicId);
        } catch (Exception ex) {
            log.warn("Failed to delete owned asset (provider={}, publicId={}) for media {}: {}",
                    provider, publicId, media.getId(), ex.getMessage());
        }
    }

    private void apply(GalleryMediaRequest request, GalleryMedia media) {
        media.setTitle(request.title());
        media.setCategory(request.category());
        media.setMediaUrl(request.mediaUrl());
        media.setThumbnailUrl(request.thumbnailUrl());
        media.setMediaType(MediaType.valueOf(request.mediaType().toUpperCase()));
        // Only overwrite storage metadata when explicitly provided. This keeps
        // existing rows with null values compatible (Supabase URLs, manual
        // external URLs).
        if (request.storagePublicId() != null) {
            media.setStoragePublicId(request.storagePublicId());
        }
        if (request.storageProvider() != null) {
            media.setStorageProvider(request.storageProvider());
        }
    }

    private GalleryMediaResponse toResponse(GalleryMedia media) {
        return new GalleryMediaResponse(
                media.getId(),
                media.getTitle(),
                media.getCategory(),
                media.getMediaUrl(),
                media.getThumbnailUrl(),
                media.getMediaType().name(),
                media.getSourceType().name(),
                media.isActive(),
                media.getStoragePublicId(),
                media.getStorageProvider(),
                media.getCreatedAt()
        );
    }
}
