import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';

const BottomNavBar = ({navigation, onQuickScan}) => {
  return (
    <View style={styles.container}>
      {/* Dashboard Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Dashboard')}
        style={styles.navButton}>
        <Image
          source={require('../assets/dashboard.png')}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Quick Scan Button (Redirects to Dashboard & Updates Scan Circle) */}
      <TouchableOpacity
        onPress={() => {
          onQuickScan(); // Triggers Quick Scan Update
          navigation.navigate('Dashboard'); // Redirects to Dashboard
        }}
        style={[styles.navButton, styles.middleButton]}>
        <Image
          source={require('../assets/shield.png')}
          style={styles.iconShield}
        />
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Settings')}
        style={styles.navButton}>
        <Image source={require('../assets/gear.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#04366D',
    height: 80,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 15,
    paddingTop: 25,
  },
  navButton: {
    padding: 5,
  },
  middleButton: {
    padding: 10,
    borderRadius: 10,
  },
  icon: {
    width: 25, // Increased size
    height: 25, // Increased size
    tintColor: '#fff',
  },
  iconShield: {
    width: 80, // Further increased size
    height: 80,
    marginBottom: 10,
  },
});

export default BottomNavBar;
