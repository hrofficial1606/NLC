package com.nlc.backend.util;

public final class SlugUtil {

    private SlugUtil() {
    }

    public static String toSlug(String value) {
        return value == null ? "" : value.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }
}
