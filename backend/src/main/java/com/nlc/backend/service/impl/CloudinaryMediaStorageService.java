package com.nlc.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.nlc.backend.dto.upload.MediaUploadResponse;
import com.nlc.backend.service.MediaStorageService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CloudinaryMediaStorageService implements MediaStorageService {

    private final Cloudinary cloudinary;

    @Override
    public MediaUploadResponse upload(MultipartFile file, String folder) {
        try {
            Map<?, ?> response = cloudinary.uploader().upload(file.getBytes(), Map.of("folder", folder));
            return new MediaUploadResponse(
                    String.valueOf(response.get("public_id")),
                    String.valueOf(response.get("secure_url")),
                    String.valueOf(response.get("resource_type"))
            );
        } catch (Exception ex) {
            throw new IllegalStateException("Media upload failed", ex);
        }
    }

    @Override
    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, Map.of());
        } catch (Exception ex) {
            throw new IllegalStateException("Media deletion failed", ex);
        }
    }
}
