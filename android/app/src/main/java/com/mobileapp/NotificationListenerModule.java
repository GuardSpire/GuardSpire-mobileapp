package com.mobileapp;

import android.content.Intent;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class NotificationListenerModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public NotificationListenerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        NotificationListenerModule.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "NotificationListener";
    }

    @ReactMethod
    public void requestNotificationPermission() {
        Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        NotificationListenerModule.reactContext.startActivity(intent);
    }

    @ReactMethod
    public void getMissedNotifications(com.facebook.react.bridge.Promise promise) {
        try {
            // Implement your logic to retrieve missed notifications
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }

    public static void sendNotificationToJS(StatusBarNotification sbn) {
        if (NotificationListenerModule.reactContext != null) {
            WritableMap params = Arguments.createMap();
            Notification notification = sbn.getNotification();
            
            if (notification.extras != null) {
                params.putString("package", sbn.getPackageName());
                params.putString("title", notification.extras.getString(Notification.EXTRA_TITLE, ""));
                params.putString("text", notification.extras.getString(Notification.EXTRA_TEXT, ""));
                params.putDouble("timestamp", sbn.getPostTime());
            }

            NotificationListenerModule.reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onNotificationReceived", params);
        }
    }
}