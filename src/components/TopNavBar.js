import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const TopNavBar = () => {
  const navigation = useNavigation();

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.iconButton}>
            <Icon name="bars" size={24} color="#04366D" />
          </TouchableOpacity>
          <Image
            source={require('../assets/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
          <Image
            source={require('../assets/user.png')}
            style={styles.profileIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    height: 60 + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  logo: {
    width: 38,
    height: 38,
    marginLeft: 8,
  },
  profileIcon: {
    width: 36,
    height: 36,
  },
});

export default TopNavBar;
