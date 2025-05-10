import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  AppState,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import NotificationAccessPrompt from '../components/NotificationAccessPrompt';
import PermissionHelper from '../utils/PermissionHelper';
import { useFocusEffect } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
  const [scanProgress, setScanProgress] = useState(0.85);
  const [securityModel, setSecurityModel] = useState({ stable: 0, suspicious: 0, critical: 0 });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showAccessPrompt, setShowAccessPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      const headers = { Authorization: `Bearer ${token}` };
  
      // 1. Quick Scan
      const quickRes = await axios.get('http://localhost:5000/api/dashboard/quick-scan', { headers });
      const protection = (quickRes.data.protectionPercent || 0) / 100;
      setScanProgress(protection);
  
      // 2. Security Model
      const secRes = await axios.get('http://localhost:5000/api/dashboard/security-model', { headers });
      setSecurityModel(secRes.data);
  
      // 3. Recent Alerts
      const recentRes = await axios.get('http://localhost:5000/api/dashboard/recent-alerts', { headers });
      setRecentAlerts(recentRes.data.recentAlerts || []);
  
    } catch (error) {
      console.error('Failed to fetch dashboard:', error?.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };  

  const checkNotificationAccess = useCallback(async (forceCheck = false) => {
    console.log('[ACCESS] Checking notification access', { forceCheck });
    setIsLoading(true);
    try {
      const hasAccess = await PermissionHelper.checkNotificationAccess(forceCheck);
      setShowAccessPrompt(!hasAccess);
      setIsBlocked(!hasAccess);
      return hasAccess;
    } catch (error) {
      console.error('[ACCESS] Error checking notification:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('[NAV] Screen focused - Fetching dashboard');
      fetchDashboardData();
      checkNotificationAccess(true);
    }, [checkNotificationAccess])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        console.log('[APP] App active - rechecking access');
        await checkNotificationAccess(true);
      }
    });
    return () => subscription.remove();
  }, [checkNotificationAccess]);

  const handleQuickScan = async () => {
    await fetchDashboardData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavBar navigation={navigation} />
      <ScrollView contentContainerStyle={styles.contentContainer}>

        {/* Quick Scan Progress */}
        <View style={[styles.card, styles.centerContent]}>
          <View style={styles.circleWrapper}>
            <CircularProgress progress={scanProgress} />
          </View>
          <TouchableOpacity
            style={[styles.quickScanButton, isBlocked && styles.disabledButton]}
            onPress={handleQuickScan}
            disabled={isBlocked}>
            <Text style={styles.quickScanText}>Quick Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Security Model */}
        <Text style={styles.sectionTitle}>Security Model Integrity</Text>
        <View style={styles.card}>
          {[
            { label: 'Stable', color: 'green', percent: securityModel.stable },
            { label: 'Suspicious', color: 'yellow', percent: securityModel.suspicious },
            { label: 'Critical', color: 'red', percent: securityModel.critical },
          ].map(({ label, color, percent }) => (
            <View style={styles.statusRow} key={label}>
              <Text style={styles.statusText}>{label}</Text>
              <View style={styles.bar}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${percent}%`, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.statusPercent}>{percent}%</Text>
            </View>
          ))}
        </View>

        {/* Recent Scam Alerts */}
        <Text style={styles.sectionTitle}>Recent Scam Alerts</Text>
          <View style={styles.card}>
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert, index) => {
                const { platform = 'Unknown', threatPercentage = 0, threatLevel = 'stable' } = alert;
                const color = threatLevel === 'critical' ? 'red' : threatLevel === 'suspicious' ? 'orange' : 'green';
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.alertRow}
                    onPress={() => !isBlocked && navigation.navigate('Report', { alert })}
                    disabled={isBlocked}>
                    <Text style={styles.alertText}>{platform}</Text>
                    <View style={styles.bar}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${Math.min(threatPercentage, 100)}%`, backgroundColor: color },
                        ]}
                      />
                    </View>
                    <Text style={styles.alertPercent}>{`${threatPercentage}%`}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 10 }}>No recent alerts</Text>
            )}
          </View>

      </ScrollView>
      <BottomNavBar
        navigation={navigation}
        onQuickScan={handleQuickScan}
        disabled={isBlocked}
      />
      <NotificationAccessPrompt
        visible={showAccessPrompt}
        onClose={() => setShowAccessPrompt(false)}
        onAllowAccess={handleQuickScan}
      />
    </View>
  );
};

const CircularProgress = ({ progress }) => {
  const size = 160;
  const strokeWidth = 20;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <View style={styles.circleContainer}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#04366D" />
            <Stop offset="100%" stopColor="#04366D" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#A2AEE4"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#F0EEEE',
    padding: 15,
    borderRadius: 5,
    elevation: 5,
    marginBottom: 15,
  },
  centerContent: {alignItems: 'center', justifyContent: 'center'},
  circleContainer: {alignItems: 'center', justifyContent: 'center'},
  progressText: {
    position: 'absolute',
    fontSize: 38,
    color: '#04366D',
    fontFamily: 'Poppins-Bold',
    top: 55,
    width: '100%',
    textAlign: 'center',
  },
  quickScanButton: {
    backgroundColor: '#04366D',
    paddingVertical: 10,
    marginTop: 15,
    borderRadius: 5,
    paddingHorizontal: 110,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quickScanText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#04366D',
  },
  bar: {
    flex: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    width: 100,
    fontSize: 14,
    color: '#333',
  },
  statusPercent: {
    fontSize: 14,
    color: '#333',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertText: {
    width: 120,
    fontSize: 14,
    color: '#333',
  },
  alertPercent: {
    fontSize: 14,
    color: '#333',
  },
  blockerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blockerText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  enableButton: {
    backgroundColor: '#04366D',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  enableButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;
