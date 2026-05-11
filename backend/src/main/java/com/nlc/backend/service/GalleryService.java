package com.nlc.backend.service;

import com.nlc.backend.dto.common.PageResponse;
import com.nlc.backend.dto.gallery.GalleryMediaRequest;
import com.nlc.backend.dto.gallery.GalleryMediaResponse;

public interface GalleryService {
    GalleryMediaResponse create(GalleryMediaRequest request);
    GalleryMediaResponse update(Long id, GalleryMediaRequest request);
    void delete(Long id);
    PageResponse<GalleryMediaResponse> list(int page, int size);
}
