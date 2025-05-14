import {
  NativeEventEmitter,
  NativeModules,
  AppState,
  Platform,
  Linking,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundTimer from 'react-native-background-timer';
import PushNotification from 'react-native-push-notification';

const { NotificationListener } = NativeModules;

if (NotificationListener && !NotificationListener.addListener) {
  NotificationListener.addListener = () => {};
  NotificationListener.removeListeners = () => {};
}

const notificationEmitter = new NativeEventEmitter(NotificationListener);

class NotificationService {
  constructor() {
    this.notifications = [];
    this.popupTrigger = null;
    this.pendingPopup = null;
    this.testMode = false;
    this.userEmail = null;

    this.recentNotifications = new Set(); // For fingerprint deduplication
    this.lastNotificationTime = 0;        // For global cooldown

    this.createChannel();
    this.setupListeners();
    this.checkAndRequestNotificationPermission();
  }

  setUserEmail(email) {
    this.userEmail = email;
    console.log(`[GuardSpire] NotificationService: User email set to ${email}`);
  }

  enableTestMode() {
    this.testMode = true;
    console.log('[TEST] Notification test mode enabled');
  }

  simulateNotification(notificationData) {
    if (!this.testMode) {
      console.warn('Test mode not enabled. Call enableTestMode() first');
      return;
    }

    const testNotification = {
      text: notificationData.text || 'Test notification',
      title: notificationData.title || 'Test App',
      package: 'com.test.app',
      timestamp: Date.now(),
      ...notificationData,
    };

    console.log('[TEST] Simulating notification:', testNotification);
    this.handleNotification(testNotification);
  }

  checkAndRequestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const status = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (!status) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'GuardSpire needs notification permissions to alert you about scams',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            }
          );

          if (granted === PermissionsAndroid.RESULTS.DENIED) {
            Alert.alert('Permission Required', 'Please enable notifications in app settings', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]);
          }
        }
      } catch (err) {
        console.warn('Permission error:', err);
      }
    }
  };

  createChannel = () => {
    PushNotification.createChannel(
      {
        channelId: 'scam-alerts',
        channelName: 'Scam Alerts',
        importance: 4,
        vibrate: true,
        vibration: 1000,
        soundName: 'default',
        playSound: true,
        lights: true,
        lightColor: '#FF0000',
      },
      (created) => console.log(`Notification channel ${created ? 'created' : 'already exists'}`)
    );
  };

  setupListeners = () => {
    this.notificationListener = notificationEmitter.addListener(
      'onNotificationReceived',
      this.handleNotification
    );

    this.backgroundInterval = BackgroundTimer.setInterval(() => {
      this.checkMissedNotifications();
    }, 30000);

    AppState.addEventListener('change', this.handleAppStateChange);

    PushNotification.configure({
      onNotification: this.handlePushNotification,
      popInitialNotification: true,
      requestPermissions: false,
    });
  };

  handlePushNotification = (notification) => {
    const { scamData, showPopup } = notification.userInfo || notification.data || {};
    const action = notification.action;

    if (notification.userInteraction) {
      if (action === 'Block' && scamData?.scan_id) {
        console.log('[GuardSpire] Block action pressed in notification');
        this.reportScan(scamData.scan_id);
      } else if (action === 'View' && scamData) {
        this.triggerPopup(scamData);
        Linking.openURL('guardspire://scam-alert');
      } else if (showPopup && scamData) {
        this.triggerPopup(scamData);
      }
    } else if (AppState.currentState !== 'active') {
      notification.finish?.(PushNotification.FetchResult.NewData);
    }
  };

  reportScan = async (scanId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('[GuardSpire] Auth token not found. Cannot report scan.');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/scan/manual/report/${scanId}/report`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        console.error('Scan report failed:', result?.error || result);
      } else {
        console.log('[GuardSpire] Scan successfully reported and blocked.');
      }
    } catch (err) {
      console.error('[GuardSpire] Failed to report scan from notification:', err);
    }
  };

  registerPopupTrigger = (callback) => {
    this.popupTrigger = callback;
    if (this.pendingPopup) {
      this.triggerPopup(this.pendingPopup);
      this.pendingPopup = null;
    }
  };

  triggerPopup = (scamData) => {
    if (this.popupTrigger) {
      if (AppState.currentState === 'active') {
        this.popupTrigger(scamData);
      } else {
        this.pendingPopup = scamData;
        this.showBackgroundNotification(scamData);
      }
    }
  };

  handleAppStateChange = (state) => {
    console.log('App state changed to:', state);
    if (state === 'active' && this.pendingPopup && this.popupTrigger) {
      this.popupTrigger(this.pendingPopup);
      this.pendingPopup = null;
    }
  };

  handleNotification = (notification) => {
    const now = Date.now();
    const cooldownPeriod = 10000; // 10 seconds between notifications

    const messageKey = `${notification.package}_${notification.title}_${notification.text?.trim()}`;

    if (!notification.text) {
      console.log('[GuardSpire] Skipped empty notification');
      return;
    }

    if (this.recentNotifications.has(messageKey)) {
      console.log('[GuardSpire] Duplicate notification skipped:', messageKey);
      return;
    }

    if (now - this.lastNotificationTime < cooldownPeriod) {
      console.log('[GuardSpire] Rate-limited notification skipped');
      return;
    }

    this.recentNotifications.add(messageKey);
    setTimeout(() => this.recentNotifications.delete(messageKey), 15000);
    this.lastNotificationTime = now;

    console.log('[GuardSpire] Processing notification:', messageKey);
    this.notifications.push(notification);
    this.processNotification(notification);
  };

  processNotification = (notification) => {
    const { text, urls } = this.extractContent(notification.text);
    this.scanContent({ ...notification, processed: { text, urls } });
  };

  extractContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content?.match(urlRegex) || [];
    const text = content?.replace(urlRegex, '').trim() || '';
    return { text, urls };
  };

  scanContent = async (data) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('[GuardSpire] Auth token not found. Scan skipped.');
        return;
      }

      const payload = {
        text: data.processed.text,
        urls: data.processed.urls,
        user: this.userEmail || 'anonymous@device',
      };

      const response = await fetch('http://localhost:5000/api/scan/notification/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('[GuardSpire] Scan result:', result);

      if (result?.show_warning) {
        this.handleThreatDetected(result);
      }
    } catch (error) {
      console.error('Scan error:', error);
    }
  };

  handleThreatDetected = (result) => {
    if (AppState.currentState === 'active') {
      this.triggerPopup(result);
    } else {
      this.showBackgroundNotification(result);
    }
  };

  showBackgroundNotification = (scamData) => {
    PushNotification.localNotification({
      channelId: 'scam-alerts',
      title: '🚨 Scam Detected!',
      message: scamData.combined_threat?.description || 'Potential threat found',
      bigText: `Threat Level: ${scamData.combined_threat?.score}\n${scamData.text_analysis?.description || ''}`,
      subText: 'Tap to view details',
      priority: 'max',
      importance: 'max',
      vibrate: true,
      vibration: 1000,
      playSound: true,
      soundName: 'default',
      autoCancel: true,
      invokeApp: true,
      userInfo: {
        showPopup: true,
        scamData,
      },
      actions: ['Block', 'View'],
    });
  };

  checkMissedNotifications = () => {
    if (AppState.currentState !== 'active') {
      console.log('Checking for missed notifications...');
      NotificationListener.getMissedNotifications?.()
        .then((notifications) => {
          notifications?.forEach(this.handleNotification);
        })
        .catch(console.error);
    }
  };

  cleanup = () => {
    this.notificationListener?.remove();
    BackgroundTimer.clearInterval(this.backgroundInterval);
    AppState.removeEventListener('change', this.handleAppStateChange);
  };
}

export default new NotificationService();
