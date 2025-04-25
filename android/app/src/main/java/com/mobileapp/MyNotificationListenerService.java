package com.mobileapp;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

public class MyNotificationListenerService extends NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        NotificationListenerModule.sendNotificationToJS(sbn);
    }

    @Override
    public void onListenerConnected() {
        // Service connected
    }
}