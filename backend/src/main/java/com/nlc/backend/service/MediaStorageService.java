package com.nlc.backend.service;

import com.nlc.backend.dto.upload.MediaUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface MediaStorageService {
    MediaUploadResponse upload(MultipartFile file, String folder);
    void delete(String publicId);
}
