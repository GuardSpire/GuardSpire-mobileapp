import { NativeEventEmitter, NativeModules, AppState } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

const { NotificationListener } = NativeModules;
const notificationEmitter = new NativeEventEmitter(NotificationListener);

class NotificationService {
  constructor() {
    this.notifications = [];
    this.setupListeners();
  }

  setupListeners = () => {
    // Foreground listener
    this.notificationListener = notificationEmitter.addListener(
      'onNotificationReceived',
      this.handleNotification
    );

    // Background check every 15 seconds
    this.backgroundInterval = BackgroundTimer.setInterval(() => {
      this.checkMissedNotifications();
    }, 15000);

    // App state handler
    AppState.addEventListener('change', this.handleAppStateChange);
  };

  handleNotification = (notification) => {
    console.log('Received notification:', notification);
    this.notifications.push(notification);
    this.processNotification(notification);
  };

  processNotification = (notification) => {
    const { text, urls } = this.extractContent(notification.text);
    this.sendToBackend({
      ...notification,
      processed: { text, urls }
    });
  };

  extractContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content?.match(urlRegex) || [];
    const text = content?.replace(urlRegex, '').trim() || '';
    return { text, urls };
  };

  sendToBackend = async (data) => {
    try {
      const response = await fetch('YOUR_BACKEND_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      console.log('Backend response:', response.status);
    } catch (error) {
      console.error('Backend error:', error);
    }
  };

  checkMissedNotifications = () => {
    if (AppState.currentState !== 'active') {
      NotificationListener.getMissedNotifications()
        .then(notifications => {
          notifications?.forEach(this.handleNotification);
        });
    }
  };

  handleAppStateChange = (state) => {
    if (state === 'active') {
      this.checkMissedNotifications();
    }
  };

  requestPermission = () => {
    NotificationListener.requestNotificationPermission();
  };

  cleanup = () => {
    this.notificationListener?.remove();
    BackgroundTimer.clearInterval(this.backgroundInterval);
    AppState.removeEventListener('change', this.handleAppStateChange);
  };
}

export default new NotificationService();