package com.nlc.backend.service;

public interface NotificationService {
    void notifyUser(Long userId, String title, String message, String type);
}
