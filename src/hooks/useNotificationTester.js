// src/hooks/useNotificationTester.js
import { useEffect } from 'react';
import notificationTester from '../utils/notificationTester';

export const useNotificationTester = (autoStart = true) => {
  useEffect(() => {
    if (autoStart) {
      notificationTester.start();
      notificationTester.requestPermission();
    }

    return () => {
      notificationTester.stop();
    };
  }, [autoStart]);
};