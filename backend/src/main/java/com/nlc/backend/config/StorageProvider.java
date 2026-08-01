package com.nlc.backend.config;

/**
 * Active storage backend. Controlled by app.storage.provider in application.yml.
 * Supported: SUPABASE, CLOUDINARY, LOCAL.
 */
public enum StorageProvider {
    SUPABASE,
    CLOUDINARY,
    LOCAL
}
