import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UpdateOtpFlowModal from '../modals/UpdateOtpFlowModal';

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    if (!username || !email || !password || !confirmPassword) {
      return setError('All fields are required.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        email,
        username,
        password,
      });

      if (response.status === 201) {
        await AsyncStorage.setItem('email', email);
        setShowOtpModal(true);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Sign-up failed. Please try again.';
      console.error('Sign up failed:', msg);
      setError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../assets/Logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>GUARD SPIRE</Text>

        <TextInput
          style={styles.input}
          placeholder='Username (e.g., "Joe Fernando")'
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder='Email (e.g., "joe12@example.com")'
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon name={passwordVisible ? 'eye' : 'eye-slash'} size={20} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Confirm your password"
            placeholderTextColor="#888"
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
            <Icon name={confirmPasswordVisible ? 'eye' : 'eye-slash'} size={20} color="black" />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <UpdateOtpFlowModal
        visible={showOtpModal}
        purpose={'signup'}
        onClose={() => setShowOtpModal(false)}
        onOtpSuccess={() => {
          console.log('Signup confirmed via OTP');
          navigation.navigate('SignIn');
          setShowOtpModal(false);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    letterSpacing: 7,
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
    color: 'black',
  },
  input: {
    width: '100%',
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 30,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 30,
  },
  inputPassword: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#04366D',
    paddingVertical: 12,
    paddingHorizontal: 110,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 80,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInText: {
    fontSize: 14,
    color: '#000',
  },
  signInLink: {
    color: '#04366D',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
