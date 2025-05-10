import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Store & get email

const UpdateOtpFlowModal = ({ visible, onClose, onOtpSuccess, skipOtp = false }) => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (visible && skipOtp) {
      setStep(3); // Skip OTP if allowed
    } else if (visible) {
      setStep(1);
    }
  }, [visible, skipOtp]);

  const reset = () => {
    setOtp('');
    setOtpError('');
    setStep(1);
    onClose();
  };

  const handleVerify = async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      if (!email) {
        setOtpError('Missing email. Try again.');
        return;
      }
  
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email: email,
        otp: otp,
        purpose: 'login',
      });
  
      if (response.status === 200) {
        console.log('OTP verified successfully!');
  
        const token = response.data.token; // ✅ Get the token from response
        await AsyncStorage.setItem('token', token); // ✅ Save token to AsyncStorage
  
        setStep(3);
        onOtpSuccess(); // ✅ Navigate to Dashboard
      }
    } catch (err) {
      console.error('OTP verification failed:', err?.response?.data?.error || err.message);
      setOtpError('Incorrect OTP. Please try again.');
    }
  };
  

  const renderStep = () => {
    if (step === 1 && !skipOtp) {
      return (
        <View style={styles.box}>
          <Text style={styles.message}>
            We have sent a one-time password to your email. Enter it to continue.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
            <Text style={styles.buttonText}>Ok</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (step === 2 && !skipOtp) {
      return (
        <View style={styles.box}>
          <Text style={styles.title}>Enter Your OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your one-time password"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          {otpError ? <Text style={styles.error}>{otpError}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={styles.box}>
          <Text style={styles.successHeading}>Changes have been Updated</Text>
          <Text style={styles.thankYou}>Thank You!</Text>
          <TouchableOpacity style={styles.button} onPress={reset}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={reset}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View>{renderStep()}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    paddingVertical: 8,
    marginBottom: 15,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#04366D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    color: '#04366D',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  thankYou: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#04366D',
    marginBottom: 15,
  },
});

export default UpdateOtpFlowModal;
