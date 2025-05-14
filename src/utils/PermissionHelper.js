import { NativeModules, Platform, Linking } from 'react-native';
const { NotificationAccessChecker } = NativeModules;

export default {
  async checkNotificationAccess(forceCheck = false) {
    console.log('[PERM] Checking notification access', { forceCheck });
    if (Platform.OS !== 'android') {
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
      return false;
    }

    try {
      // First try the direct method
      if (NotificationAccessChecker?.openNotificationAccessSettings) {
        await NotificationAccessChecker.openNotificationAccessSettings();
        return true;
      }

      // Fallback to generic intent
      await Linking.openURL('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
      return true;
    } catch (error) {
      console.error('[PERM] Failed to open settings:', error);
      return false;
    }
  },
};