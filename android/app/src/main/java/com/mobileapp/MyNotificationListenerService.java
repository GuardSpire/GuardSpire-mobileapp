package com.mobileapp;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

public class MyNotificationListenerService extends NotificationListenerService {

    private static final String TAG = "MyNotificationService";

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        Log.d(TAG, "Notification posted from package: " + sbn.getPackageName());

        // Keep your JS bridge if needed
        try {
            NotificationListenerModule.sendNotificationToJS(sbn);
        } catch (Exception e) {
            Log.e(TAG, "Failed to send notification to JS", e);
        }
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        Log.d(TAG, "Notification removed from package: " + sbn.getPackageName());
    }

    @Override
    public void onListenerConnected() {
        Log.d(TAG, "Notification listener service connected.");
        super.onListenerConnected();
    }
}
