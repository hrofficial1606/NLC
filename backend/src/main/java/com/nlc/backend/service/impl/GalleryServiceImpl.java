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
import com.nlc.backend.util.PageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GalleryServiceImpl implements GalleryService {

    private final GalleryMediaRepository galleryMediaRepository;

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
        galleryMediaRepository.deleteById(id);
    }

    @Override
    public PageResponse<GalleryMediaResponse> list(int page, int size) {
        return PageMapper.toResponse(galleryMediaRepository.findAll(PageRequest.of(page, size)), this::toResponse);
    }

    private void apply(GalleryMediaRequest request, GalleryMedia media) {
        media.setTitle(request.title());
        media.setCategory(request.category());
        media.setMediaUrl(request.mediaUrl());
        media.setThumbnailUrl(request.thumbnailUrl());
        media.setMediaType(MediaType.valueOf(request.mediaType().toUpperCase()));
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
                media.getCreatedAt()
        );
    }
}
