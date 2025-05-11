package com.mobileapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader


import com.levelasquez.androidopensettings.AndroidOpenSettingsPackage
import com.mobileapp.NotificationAccessCheckerPackage
import com.mobileapp.NotificationListenerPackage // Import NotificationListenerPackage
import com.facebook.react.bridge.ReactApplicationContext // Added for custom ReactPackage
import com.facebook.react.bridge.NativeModule // Added for custom ReactPackage
import com.facebook.react.uimanager.ViewManager // Added for custom ReactPackage
import java.util.Arrays // Added for custom ReactPackage

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    add(NotificationListenerPackage()) // Keep your existing NotificationListenerPackage
                    
                    // Add only the access checker module
                    add(object : ReactPackage {
                        override fun createNativeModules(
                            reactContext: ReactApplicationContext
                        ): List<NativeModule> {
                            return listOf(NotificationAccessCheckerModule(reactContext))
                        }

                        override fun createViewManagers(
                            reactContext: ReactApplicationContext
                        ): List<ViewManager<*, *>> {
                            return emptyList()
                        }
                    })
                }

            override fun getJSMainModuleName(): String = "index"
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
            override val isNewArchEnabled: Boolean = false
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, OpenSourceMergedSoMapping)
          // Fabric & TurboModules are disabled, so skip loading
    }
}
