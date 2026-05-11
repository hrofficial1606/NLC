package com.nlc.backend.service.impl;

import com.nlc.backend.entity.Notification;
import com.nlc.backend.entity.User;
import com.nlc.backend.entity.enums.NotificationType;
import com.nlc.backend.repository.NotificationRepository;
import com.nlc.backend.repository.UserRepository;
import com.nlc.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void notifyUser(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId).orElse(null);
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(NotificationType.valueOf(type));
        notificationRepository.save(notification);
    }
}
