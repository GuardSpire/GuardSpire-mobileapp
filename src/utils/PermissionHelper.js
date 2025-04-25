// src/utils/PermissionHelper.js
import { NativeModules, Platform } from 'react-native';
const { NotificationAccessChecker } = NativeModules;

let lastKnownState = null;

export default {
  async checkNotificationAccess(forceCheck = false) {
    console.log('[PERM] Checking notification access', { forceCheck });
    if (Platform.OS !== 'android') {
      console.log('[PERM] Not Android, skipping check');
      return true;
    }

    try {
      if (!NotificationAccessChecker?.isNotificationAccessEnabled) {
        console.error('[PERM] Native module not linked properly');
        return false;
      }

      const hasAccess = await NotificationAccessChecker.isNotificationAccessEnabled(forceCheck);
      console.log(`[PERM] Access status: ${hasAccess}`);
      return hasAccess;
    } catch (error) {
      console.error('[PERM] Check failed:', error.message);
      return false;
    }
  },

  async requestNotificationAccess() {
    console.log('[PERM] Requesting access');
    if (Platform.OS !== 'android') {
      console.log('[PERM] Not Android, skipping request');
      return false;
    }

    try {
      if (!NotificationAccessChecker?.openNotificationAccessSettings) {
        console.error('[PERM] Native module not linked properly');
        return false;
      }

      await NotificationAccessChecker.openNotificationAccessSettings();
      console.log('[PERM] Settings opened successfully');
      return true;
    } catch (error) {
      console.error('[PERM] Failed to open settings:', error);
      return false;
    }
  },
};