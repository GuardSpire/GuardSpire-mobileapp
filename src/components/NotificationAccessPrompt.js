import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const NotificationAccessPrompt = ({ visible, onClose, onAllowAccess }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>🔔 Notification Access Required</Text>
          <Text style={styles.message}>
            To detect and protect you from scams, our app needs permission to read your notifications.
          </Text>
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to enable:</Text>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Tap "Open Settings" below</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Find our app in the list</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Toggle the switch to ON</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Return to this app</Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.allowButton]}
              onPress={onAllowAccess}
            >
              <Text style={styles.buttonText}>Open Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
    color: '#555',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    backgroundColor: '#04366D',
    color: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'column',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  allowButton: {
    backgroundColor: '#04366D',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#04366D',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelText: {
    color: '#04366D',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NotificationAccessPrompt;