package com.nlc.backend.dto.dashboard;

import java.math.BigDecimal;

public record DashboardAnalyticsResponse(
        long totalUsers,
        long totalBookings,
        BigDecimal totalRevenue,
        long featuredEvents,
        long openInquiries
) {
}
