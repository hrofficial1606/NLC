package com.nlc.backend.dto.dashboard;

import java.math.BigDecimal;

public record DashboardAnalyticsResponse(
        long totalUsers,
        long totalEvents,
        long upcomingEvents,
        long totalRegistrations,
        long pendingRegistrations,
        long approvedRegistrations,
        long rejectedRegistrations,
        long totalMembers,
        long galleryItems,
        BigDecimal totalRevenue,
        long openInquiries
) {
}
