import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';

const WelcomeScreen = ({navigation}) => {
  const [isSignUpPressed, setSignUpPressed] = useState(false);
  const [isSignInPressed, setSignInPressed] = useState(false);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/Logo.png')} // Replace with actual image path
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>GUARD SPIRE</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Empowering you with trusted security and the highest level of
        protection.
      </Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, isSignUpPressed && styles.buttonActive]}
          onPress={() => navigation.navigate('SignUp')}
          onPressIn={() => setSignUpPressed(true)}
          onPressOut={() => setSignUpPressed(false)}>
          <Text
            style={[
              styles.buttonText,
              isSignUpPressed && styles.buttonTextActive,
            ]}>
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.button, isSignInPressed && styles.buttonActive]}
          onPress={() => navigation.navigate('SignIn')}
          onPressIn={() => setSignInPressed(true)}
          onPressOut={() => setSignInPressed(false)}>
          <Text
            style={[
              styles.buttonText,
              isSignInPressed && styles.buttonTextActive,
            ]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  logo: {
    width: 350,
    height: 350,
    marginBottom: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    letterSpacing: 7,
    marginBottom: 15,
    fontFamily: 'Poppins-Bold',
    color: 'black',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
    fontFamily: 'Poppins-Medium',
    color: 'black',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: '#fff', // Set default background color
  },
  buttonActive: {
    backgroundColor: '#04366D',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: 'black', 
  },
  buttonTextActive: {
    color: 'white',
  },
  borderWidth: 1,
  borderColor: '#04366D', // Set border color to match active background color
});

export default WelcomeScreen;