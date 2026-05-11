package com.nlc.backend.config;

import com.cloudinary.Cloudinary;
import java.util.HashMap;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(AppProperties appProperties) {
        Map<String, String> values = new HashMap<>();
        values.put("cloud_name", appProperties.getMedia().getCloudinary().getCloudName());
        values.put("api_key", appProperties.getMedia().getCloudinary().getApiKey());
        values.put("api_secret", appProperties.getMedia().getCloudinary().getApiSecret());
        values.put("secure", "true");
        return new Cloudinary(values);
    }
}
