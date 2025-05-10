import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

const ForgotPasswordModalController = ({ visible, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const correctOtp = '7890'; // Mock OTP for demonstration

  const resetAll = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpError(false);
    setPasswordError(false);
    onClose();
  };

  const handleOtpVerify = () => {
    if (otp === correctOtp) {
      setOtpError(false);
      setStep(3);
    } else {
      setOtpError(true);
    }
  };

  const handlePasswordReset = () => {
    if (newPassword === confirmPassword) {
      setPasswordError(false);
      setStep(4);
    } else {
      setPasswordError(true);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ModalView title="Forgot Password">
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep(2)}
            >
              <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>
          </ModalView>
        );
      case 2:
        return (
          <ModalView title="Enter OTP">
            <TextInput
              placeholder="Enter OTP"
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
            />
            {otpError && <Text style={styles.error}>Invalid OTP</Text>}
            <TouchableOpacity
              style={styles.button}
              onPress={handleOtpVerify}
            >
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          </ModalView>
        );
      case 3:
        return (
          <ModalView title="Reset Password">
            <TextInput
              placeholder="New Password"
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              placeholder="Confirm Password"
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {passwordError && (
              <Text style={styles.error}>Passwords do not match</Text>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={handlePasswordReset}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </ModalView>
        );
      case 4:
        return (
          <ModalView title="Success">
            <Text>Your password has been reset successfully!</Text>
            <TouchableOpacity style={styles.button} onPress={resetAll}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </ModalView>
        );
      default:
        return null;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={resetAll}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>{renderStep()}</TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const ModalView = ({ title, children }) => (
  <View style={styles.modalBox}>
    {title && <Text style={styles.modalTitle}>{title}</Text>}
    {children}
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#04366D',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default ForgotPasswordModalController;