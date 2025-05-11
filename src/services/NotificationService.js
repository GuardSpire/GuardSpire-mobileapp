import {
  NativeEventEmitter,
  NativeModules,
  AppState,
  Platform,
  Linking,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import PushNotification from 'react-native-push-notification';

const { NotificationListener } = NativeModules;

// Ensure no warnings if module lacks addListener/removeListeners
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

    this.createChannel();
    this.setupListeners();
    this.checkAndRequestNotificationPermission();
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
      (created) => console.log(`Notification channel ${created ? 'created' : 'exists'}`)
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

    if (notification.userInteraction) {
      if (showPopup && scamData) {
        this.triggerPopup(scamData);
      }
      if (AppState.currentState !== 'active') {
        Linking.openURL('guardspire://scam-alert');
      }
    } else if (AppState.currentState !== 'active') {
      notification.finish?.(PushNotification.FetchResult.NewData);
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
    console.log('Received notification:', notification);
    if (this.testMode) console.log('[TEST] Processing test notification');
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
      if (this.testMode) {
        const testResult = {
          show_warning: true,
          combined_threat: {
            score: 9.4,
            category: 'Critical',
            confidence: 0.98,
            source: 'text_analysis',
          },
          text_analysis: {
            is_scam: true,
            confidence: 0.98,
            description: 'TEST: Classified as SCAM (Confidence: 98%)',
          },
        };
        return this.handleThreatDetected(testResult);
      }

      const response = await fetch('http://localhost:5000/api/scan/notification/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: data.processed.text,
          urls: data.processed.urls,
          user: 'anonymous@device',
        }),
      });

      const result = await response.json();
      console.log('Scan result:', result);

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
      bigText: `Threat Level: ${scamData.combined_threat?.score}\n${scamData.text_analysis?.description}`,
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
        scamData: scamData,
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
