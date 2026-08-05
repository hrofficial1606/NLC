package com.nlc.backend.service.impl;

import com.nlc.backend.dto.upload.StorageUploadResult;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.service.StorageService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Filesystem-backed storage used for the `local` profile when no Supabase
 * credentials are available. Writes under the configured root and serves the
 * files via Spring's static resource handler at /media/**.
 */
@Service
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "LOCAL")
public class LocalStorageService implements StorageService {

    private final Path root;

    public LocalStorageService(@Value("${app.storage.local.root:./.local-storage}") String rootDir) throws IOException {
        this.root = Paths.get(rootDir).toAbsolutePath().normalize();
        Files.createDirectories(root.resolve(PUBLIC_BUCKET));
        Files.createDirectories(root.resolve(PRIVATE_BUCKET));
    }

    @Override
    public StorageUploadResult uploadPublic(MultipartFile file, String folder, String objectKey) {
        return write(file, PUBLIC_BUCKET, folder, objectKey, true);
    }

    @Override
    public StorageUploadResult uploadPrivate(MultipartFile file, String folder, String objectKey) {
        return write(file, PRIVATE_BUCKET, folder, objectKey, false);
    }

    @Override
    public void delete(String bucket, String objectKey) {
        try {
            Files.deleteIfExists(resolve(bucket, objectKey));
        } catch (IOException ignored) {
            // best-effort cleanup
        }
    }

    @Override
    public String resolveViewUrl(String bucket, String objectKey) {
        if (PUBLIC_BUCKET.equals(bucket)) {
            return "/media/" + bucket + "/" + objectKey;
        }
        // Local fallback: expose a deterministic temp URL. Local profile only.
        return "/media/" + bucket + "/" + objectKey;
    }

    private StorageUploadResult write(MultipartFile file, String bucket, String folder, String objectKey, boolean publicBucket) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        try {
            Path target = resolve(bucket, joinKey(folder, objectKey));
            Files.createDirectories(target.getParent());
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StorageUploadResult(
                    joinKey(folder, objectKey),
                    publicBucket ? "/media/" + bucket + "/" + joinKey(folder, objectKey) : null,
                    null,
                    !publicBucket
            );
        } catch (IOException ex) {
            throw new IllegalStateException("Local storage write failed", ex);
        }
    }

    private Path resolve(String bucket, String key) {
        Path target = root.resolve(bucket).resolve(key).normalize();
        if (!target.startsWith(root)) {
            throw new BadRequestException("Invalid storage key");
        }
        return target;
    }

    private static String joinKey(String folder, String objectKey) {
        return folder == null || folder.isBlank() ? objectKey : folder + "/" + objectKey;
    }
}
