// src/utils/notificationTester.js
import { NativeEventEmitter, NativeModules } from 'react-native';

class NotificationTester {
  constructor() {
    this.emitter = new NativeEventEmitter(NativeModules.NotificationListener);
    this.active = false;
  }

  start() {
    if (this.active) return;
    
    this.subscription = this.emitter.addListener(
      'onNotificationReceived',
      (notification) => {
        console.log('\x1b[36m%s\x1b[0m', '══════ NOTIFICATION DETECTED ══════');
        console.log('Application:', notification.package);
        console.log('Title      :', notification.title || '(no title)');
        console.log('Content    :', notification.text);
        console.log('Timestamp  :', new Date(notification.timestamp).toLocaleString());
        console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════\n');
      }
    );
    
    this.active = true;
    console.log('\x1b[32mNotification listener started\x1b[0m');
  }

  stop() {
    if (!this.active) return;
    
    this.subscription.remove();
    this.active = false;
    console.log('\x1b[33mNotification listener stopped\x1b[0m');
  }

  async requestPermission() {
    try {
      await NativeModules.NotificationListener.requestNotificationPermission();
      console.log('\x1b[32mNotification permission requested\x1b[0m');
    } catch (error) {
      console.error('\x1b[31mPermission error:', error, '\x1b[0m');
    }
  }
}

export default new NotificationTester();