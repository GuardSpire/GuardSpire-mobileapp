import React, { useEffect } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import WelcomeScreen from '../src/screens/WelcomeScreen';
import SignInScreen from '../src/screens/SignInScreen';
import SignUpScreen from '../src/screens/SignUpScreen';
import DashboardScreen from '../src/screens/DashboardScreen';
import ManualScannerScreen from '../src/screens/ManualScannerScreen';
import ReportScreen from '../src/screens/ReportScreen';
import HistoryScreen from '../src/screens/HistoryScreen';
import SettingsScreen from '../src/screens/SettingsScreen';
import CustomDrawer from '../src/components/CustomDrawer';
import NotificationService from '../src/services/NotificationService';
import PermissionHelper from '../src/utils/PermissionHelper';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
  <Drawer.Navigator
    initialRouteName="Dashboard"
    drawerContent={props => <CustomDrawer {...props} />}
    screenOptions={{ headerShown: false }}>
    <Drawer.Screen name="Dashboard" component={DashboardScreen} />
    <Drawer.Screen name="ManualScanner" component={ManualScannerScreen} />
    <Drawer.Screen name="Report" component={ReportScreen} />
    <Drawer.Screen name="History" component={HistoryScreen} />
    <Drawer.Screen name="Settings" component={SettingsScreen} />
  </Drawer.Navigator>
);

const App = () => {

  const handleNavigationStateChange = state => {
    if (!state) return;
    const currentRoute = getActiveRouteName(state);

    if (Platform.OS === 'android') {
      changeNavigationBarColor(
        ['Welcome', 'SignIn', 'SignUp'].includes(currentRoute)
          ? 'white'
          : 'black',
        false,
      );
    }
  };

  const getActiveRouteName = state => {
    const route = state.routes[state.index];
    if (route.state) return getActiveRouteName(route.state);
    return route.name;
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <NavigationContainer onStateChange={handleNavigationStateChange}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Main" component={DrawerNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;