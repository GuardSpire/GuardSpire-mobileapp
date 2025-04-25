import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CustomDrawer = props => {
  const navigation = useNavigation();

  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        {/* Go Back Icon */}
        <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => props.navigation.closeDrawer()}
        >
        <Icon name="chevron-circle-right" size={30} color="#04366D" />
        </TouchableOpacity>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={require('../assets/user.png')}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>Joe Fernando</Text>
        </View>

        {/* Drawer Menu Items */}
        <View style={styles.drawerItems}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => props.navigation.navigate('Dashboard')}>
            <Image
              source={require('../assets/dashblue.png')}
              style={styles.icon}
            />
            <Text style={styles.menuText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => props.navigation.navigate('ManualScanner')}>
            <Image
              source={require('../assets/computer-security-shield.png')}
              style={styles.icon}
            />
            <Text style={styles.menuText}>Msg & URL Scanner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => props.navigation.navigate('Report')}>
            <Image
              source={require('../assets/document.png')}
              style={styles.icon}
            />
            <Text style={styles.menuText}>Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => props.navigation.navigate('History')}>
            <Image
              source={require('../assets/history.png')}
              style={styles.icon}
            />
            <Text style={styles.menuText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => props.navigation.navigate('Settings')}>
            <Image
              source={require('../assets/gearblue.png')}
              style={styles.icon}
            />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate('Welcome')}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  goBackButton: {
    padding: 10,
    alignItems: 'flex-start',
    marginLeft: 280,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 35,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginTop: 10,
    color: '#04366D',
  },
  drawerItems: {
    paddingVertical: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#04366D',
    fontFamily: 'Poppins-Bold',
    letterSpacing: 1,
  },
  logoutButton: {
    backgroundColor: '#04366D',
    paddingVertical: 10,
    alignItems: 'center',
    margin: 30,
    borderRadius: 5,
    marginBottom: 50,
  },
  logoutText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
});

export default CustomDrawer;
