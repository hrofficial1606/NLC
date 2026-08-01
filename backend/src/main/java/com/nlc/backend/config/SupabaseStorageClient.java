package com.nlc.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nlc.backend.dto.upload.StorageUploadResult;
import com.nlc.backend.exception.BadRequestException;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Minimal Supabase Storage client. Talks directly to the REST Storage API using
 * the service-role key. Service-role key MUST NEVER reach the frontend.
 *
 * Rest endpoints used:
 *   POST   {supabaseUrl}/storage/v1/object/{bucket}/{path}
 *   DELETE {supabaseUrl}/storage/v1/object/{bucket}/{path}
 *   POST   {supabaseUrl}/storage/v1/object/sign/{bucket}/{path}
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageClient {

    private final StorageProperties storageProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public StorageUploadResult upload(MultipartFile file, String bucket, String objectKey) {
        validateFile(file);
        StorageProperties.Supabase cfg = requireConfigured();

        try {
            String encodedKey = encodePath(objectKey);
            URI uri = URI.create(cfg.getUrl()
                    + "/storage/v1/object/" + bucket
                    + "/" + encodedKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + cfg.getServiceRoleKey())
                    .header("Content-Type", file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .header("x-upsert", "true")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.error("Supabase upload failed status={} body={}", response.statusCode(), response.body());
                throw new IllegalStateException("Storage upload failed");
            }

            boolean isPrivate = cfg.getPrivateBucket().equals(bucket);
            String publicUrl = isPrivate ? null : publicUrl(cfg.getUrl(), bucket, objectKey);
            return new StorageUploadResult(objectKey, publicUrl, null, isPrivate);
        } catch (IOException | InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Storage upload error", ex);
        }
    }

    public void delete(String bucket, String objectKey) {
        StorageProperties.Supabase cfg = requireConfigured();
        try {
            URI uri = URI.create(cfg.getUrl()
                    + "/storage/v1/object/" + bucket
                    + "/" + encodePath(objectKey));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + cfg.getServiceRoleKey())
                    .DELETE()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2 && response.statusCode() != 404) {
                log.warn("Supabase delete returned {} body={}", response.statusCode(), response.body());
            }
        } catch (IOException | InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("Storage delete error for {}/{}: {}", bucket, objectKey, ex.getMessage());
        }
    }

    /**
     * Generates a short-lived signed URL for the private bucket so admin can
     * view a payment proof on demand. Returned URL is safe to expose for the
     * configured TTL only — it is NOT a public URL.
     */
    public String createSignedUrl(String bucket, String objectKey) {
        StorageProperties.Supabase cfg = requireConfigured();
        try {
            String encodedKey = encodePath(objectKey);
            URI uri = URI.create(cfg.getUrl()
                    + "/storage/v1/object/sign/" + bucket
                    + "/" + encodedKey);

            String body = "{\"expiresIn\":" + cfg.getSignedUrlTtlSeconds() + "}";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + cfg.getServiceRoleKey())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                throw new IllegalStateException("Signed URL generation failed: " + response.body());
            }
            JsonNode node = objectMapper.readTree(response.body());
            String signedPath = node.path("signedURL").asText(null);
            if (signedPath == null) {
                throw new IllegalStateException("Signed URL missing in response");
            }
            return cfg.getUrl() + signedPath;
        } catch (IOException | InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Signed URL error", ex);
        }
    }

    public String publicUrl(String bucket, String objectKey) {
        StorageProperties.Supabase cfg = requireConfigured();
        if (cfg.getPrivateBucket().equals(bucket)) {
            throw new BadRequestException("Private bucket objects do not have public URLs");
        }
        return publicUrl(cfg.getUrl(), bucket, objectKey);
    }

    private String publicUrl(String base, String bucket, String objectKey) {
        return base + "/storage/v1/object/public/" + bucket + "/" + encodePath(objectKey);
    }

    private StorageProperties.Supabase requireConfigured() {
        StorageProperties.Supabase cfg = storageProperties.getSupabase();
        if (cfg.getUrl() == null || cfg.getUrl().isBlank()
                || cfg.getServiceRoleKey() == null || cfg.getServiceRoleKey().isBlank()) {
            throw new IllegalStateException(
                    "Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
        }
        return cfg;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        String mime = file.getContentType();
        if (mime == null
                || !(mime.equalsIgnoreCase("image/jpeg")
                || mime.equalsIgnoreCase("image/png")
                || mime.equalsIgnoreCase("image/webp"))) {
            throw new BadRequestException("Unsupported file type: " + mime);
        }
        long maxBytes = 10L * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new BadRequestException("File too large (max 10MB)");
        }
    }

    private static String encodePath(String path) {
        // Storage keys may include '/' for object folder structure; we keep
        // each segment encoded but preserve slashes for hierarchy.
        String[] segments = path.split("/");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < segments.length; i++) {
            if (i > 0) sb.append('/');
            sb.append(URLEncoder.encode(segments[i], StandardCharsets.UTF_8)
                    .replace("+", "%20"));
        }
        return sb.toString();
    }
}
