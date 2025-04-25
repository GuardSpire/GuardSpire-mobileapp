// android/app/src/main/java/com/mobileapp/NotificationAccessCheckerModule.kt
package com.mobileapp

import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

class NotificationAccessCheckerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val EVENT_ON_ACCESS_CHANGE = "onNotificationAccessChange"
    }

    override fun getName() = "NotificationAccessChecker"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun isNotificationAccessEnabled(forceCheck: Boolean, promise: Promise) {
        try {
            val enabledListeners = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                "enabled_notification_listeners"
            ) ?: ""

            val packageName = reactApplicationContext.packageName
            // More thorough package name checking
            val hasAccess = enabledListeners.split(":").any { listener ->
                ComponentName.unflattenFromString(listener)?.packageName == packageName
            }

            Log.d("NotificationAccess", "Force check: $forceCheck")
            Log.d("NotificationAccess", "Enabled listeners: $enabledListeners")
            Log.d("NotificationAccess", "Package: $packageName")
            Log.d("NotificationAccess", "Has access: $hasAccess")

            promise.resolve(hasAccess)
        } catch (e: Exception) {
            Log.e("NotificationAccess", "Access check failed", e)
            promise.reject("ACCESS_ERROR", "Check failed", e)
        }
    }

    @ReactMethod
    fun openNotificationAccessSettings() {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                putExtra(":settings:fragment_args_key", reactApplicationContext.packageName)
            }
            reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            Log.e("NotificationAccess", "Failed to open settings", e)
        }
    }
}