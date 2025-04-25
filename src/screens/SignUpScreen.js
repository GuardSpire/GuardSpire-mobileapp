import React, {useState} from 'react';
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
import UpdateOtpFlowModal from '../modals/UpdateOtpFlowModal';

const SignUpScreen = ({navigation}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleSignUp = () => {
    // Call backend sign-up logic here

    // Trigger OTP verification modal
    setShowOtpModal(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo */}
        <Image
          source={require('../assets/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>GUARD SPIRE</Text>

        {/* Username Input */}
        <TextInput
          style={styles.input}
          placeholder='Username (e.g., "Joe Fernando")'
          placeholderTextColor="#888"
        />

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder='Email (e.g., "joe12@example.com")'
          placeholderTextColor="#888"
          keyboardType="email-address"
        />

        {/* Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Icon name={passwordVisible ? 'eye' : 'eye-slash'} size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Confirm your password"
            placeholderTextColor="#888"
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
            <Icon name={confirmPasswordVisible ? 'eye' : 'eye-slash'} size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Already Have an Account? Redirect to Sign-In */}
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* OTP Verification Modal */}
      <UpdateOtpFlowModal
        visible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onOtpSuccess={() => {
          console.log('Signup confirmed via OTP');
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
