// src/components/NotificationAccessPrompt.js
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const NotificationAccessPrompt = ({ visible, onClose, onAllowAccess }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true} // Added for better appearance on devices with translucent status bars
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Notification Access Required</Text>
          <Text style={styles.message}>
            To protect you from scams, we need access to your notifications.
          </Text>
          <Text style={styles.instructions}>
            1. Tap "Allow Access" below{"\n"}
            2. Find our app in the list{"\n"}
            3. Toggle the switch to ON
          </Text>
          
          <TouchableOpacity
            style={styles.allowButton}
            onPress={onAllowAccess}
          >
            <Text style={styles.buttonText}>Allow Access</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)', // Darker overlay for better focus
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it's on top
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    elevation: 10, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    marginBottom: 15,
  },
  instructions: {
    marginBottom: 20,
    color: '#666',
  },
  allowButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelText: {
    color: '#007AFF',
  },
});

export default NotificationAccessPrompt;