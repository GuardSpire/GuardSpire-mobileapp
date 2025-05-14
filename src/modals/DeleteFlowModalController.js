import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the icon library

const DeleteFlowModalController = ({visible, onClose}) => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isOtpCorrect, setIsOtpCorrect] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // For new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirm password visibility

  const resetAll = () => {
    setStep(1);
    setPassword('');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setAttempts(0);
    setIsOtpCorrect(false);
    setErrors({});
    onClose();
  };

  const getToken = async () => await AsyncStorage.getItem('token');

  const handlePasswordCheck = async () => {
    try {
      const token = await getToken();
      const res = await axios.post(
        'http://localhost:5000/api/delete/confirm-password',
        {password},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (res.status === 200) {
        setStep(6); // ✅ Immediately go to delete confirm if password correct
      }
    } catch (err) {
      const newTries = attempts + 1;
      setAttempts(newTries);
      if (newTries >= 2) {
        setStep(3); // go to email entry
      } else {
        setErrors({password: 'Incorrect password'});
      }
    }
  };

  const handleSendOtp = async () => {
    try {
      const token = await getToken();
      await axios.post(
        'http://localhost:5000/api/delete/send-otp',
        {},
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      setStep(4);
    } catch (err) {
      console.error('OTP send failed:', err);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp.trim()) {
      setErrors({otp: 'OTP is required'});
      return;
    }

    try {
      const token = await getToken();
      const res = await axios.post(
        'http://localhost:5000/api/delete/verify-otp',
        {otp: otp.trim()},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      if (res.status === 200) {
        setIsOtpCorrect(true);
        setErrors({});
      }
    } catch (err) {
      setErrors({otp: 'Invalid OTP'});
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setErrors({save: 'Passwords do not match'});
      return;
    }

    try {
      const token = await getToken();
      await axios.post(
        'http://localhost:5000/api/delete/set-password',
        {newPassword},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      setStep(6);
    } catch (err) {
      setErrors({save: 'Failed to save new password'});
    }
  };

  const handleFinalDelete = async () => {
    try {
      const token = await getToken();
      await axios.delete('http://localhost:5000/api/delete/final', {
        headers: {Authorization: `Bearer ${token}`},
      });
      setStep(7);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderModal('Are you sure you want to delete your account?', [
          <ActionButtons onCancel={resetAll} onConfirm={() => setStep(2)} />,
        ]);
      case 2:
        return renderModal('Confirm Password', [
          <View style={styles.passwordInputContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              style={styles.inputBox} // Use a style without borders for the TextInput
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconContainer}>
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="black"
              />
            </TouchableOpacity>
          </View>,
          errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          ),
          <TouchableOpacity onPress={() => setStep(3)}>
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>,
          <TouchableOpacity style={styles.button} onPress={handlePasswordCheck}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>,
        ]);
      case 3:
        return renderModal('Enter Email to Send OTP', [
          <TextInput
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address" // Ensures the keyboard is optimized for email input
          />,
          <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>,
        ]);
      case 4:
        return renderModal('Verify OTP', [
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
          />,
          errors.otp && <Text style={styles.error}>{errors.otp}</Text>,
          !isOtpCorrect && (
            <TouchableOpacity style={styles.button} onPress={handleOtpVerify}>
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          ),
          isOtpCorrect && (
            <>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  placeholder="New Password"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.inputBox} // Use a style without borders for the TextInput
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.iconContainer}>
                  <Icon
                    name={showNewPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.inputBox} // Use a style without borders for the TextInput
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.iconContainer}>
                  <Icon
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="black"
                  />
                </TouchableOpacity>
              </View>

              {errors.save && <Text style={styles.error}>{errors.save}</Text>}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSavePassword}>
                <Text style={styles.buttonText}>Save Password</Text>
              </TouchableOpacity>
            </>
          ),
        ]);
      case 6:
        return renderModal('Confirm Account Deletion', [
          <View style={styles.passwordInputContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              style={styles.inputBox} // Use a style without borders for the TextInput
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconContainer}>
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="black"
              />
            </TouchableOpacity>
          </View>,
          <TouchableOpacity style={styles.button} onPress={handleFinalDelete}>
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>,
        ]);
      case 7:
        return renderModal('✅ Account Deleted', [
          <TouchableOpacity style={styles.button} onPress={resetAll}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>,
        ]);
    }
  };

  const renderModal = (title, children) => (
    <View style={styles.modalBox}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={resetAll}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>{renderStep()}</TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const ActionButtons = ({onCancel, onConfirm}) => (
  <View style={styles.row}>
    <TouchableOpacity style={styles.blueButton} onPress={onCancel}>
      <Text style={styles.buttonText}>Back</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.blueButton} onPress={onConfirm}>
      <Text style={styles.buttonText}>Yes</Text>
    </TouchableOpacity>
  </View>
);

// ---------- Styles ----------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#04366D',
  },
  input: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    marginTop: 10,
    width: '100%',
    fontSize: 14,
    color: '#000',
  },
  inputBox: {
    flex: 1, // Ensures the TextInput takes up the remaining space
    padding: 8, // Reduced padding for a smaller input area
    fontSize: 14,
    color: '#000',
  },
  button: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  link: {
    color: '#007BFF',
    fontSize: 13,
    alignSelf: 'flex-end',
    marginRight: -155,
    marginBottom: 10,
    marginTop: -10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  cancel: {
    backgroundColor: '#888',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  confirm: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  blueButton: {
    backgroundColor: '#04366D', // Blue color
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 25, // Reduced margin for smaller spacing
    paddingHorizontal: 8, // Reduced padding for a smaller box
    height: 60, // Set a fixed height for the box
    width: '100%',
  },
  iconContainer: {
    padding: 5,
  },
});

export default DeleteFlowModalController;
