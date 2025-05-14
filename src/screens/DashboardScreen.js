import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  AppState,
  ActivityIndicator,
} from 'react-native';
import Svg, {Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import NotificationAccessPrompt from '../components/NotificationAccessPrompt';
import PermissionHelper from '../utils/PermissionHelper';
import {useFocusEffect} from '@react-navigation/native';

const DashboardScreen = ({navigation, route}) => {
  const [scanProgress, setScanProgress] = useState(0.85);
  const [securityModel, setSecurityModel] = useState({
    stable: 0,
    suspicious: 0,
    critical: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showAccessPrompt, setShowAccessPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const headers = {Authorization: `Bearer ${token}`};

      const [quickRes, secRes, recentRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/quick-scan', {headers}),
        axios.get('http://localhost:5000/api/dashboard/security-model', {
          headers,
        }),
        axios.get('http://localhost:5000/api/dashboard/recent-alerts', {
          headers,
        }),
      ]);

      setScanProgress((quickRes.data.protectionPercent || 0) / 100);
      setSecurityModel({
        stable: secRes.data.stable || 0,
        suspicious: secRes.data.suspicious || 0,
        critical: secRes.data.critical || 0,
      });
      setRecentAlerts(
        recentRes.data.recentAlerts?.filter(alert => !alert.deleted) || [],
      );
    } catch (error) {
      console.error(
        'Dashboard load failed:',
        error?.response?.data || error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllowAccess = async () => {
    setShowAccessPrompt(false);
    const granted = await PermissionHelper.requestNotificationAccess(); // opens settings
    if (granted) {
      const hasAccess = await checkNotificationAccess(true);
      setShowAccessPrompt(!hasAccess);
      setIsBlocked(!hasAccess);
    }
  };

  const checkNotificationAccess = useCallback(async (forceCheck = false) => {
    try {
      const hasAccess = await PermissionHelper.checkNotificationAccess(
        forceCheck,
      );
      setShowAccessPrompt(!hasAccess);
      setIsBlocked(!hasAccess);

      // Add debug log
      console.log('[DEBUG] showAccessPrompt:', !hasAccess);

      return hasAccess;
    } catch (error) {
      console.error('Notification permission check failed:', error);
      return false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      checkNotificationAccess();
    }, [refreshTrigger]),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      checkNotificationAccess(); // This will update showAccessPrompt and isBlocked
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, [checkNotificationAccess]);

  const handleQuickScan = async () => {
    setIsLoading(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    if (route.params?.refresh) {
      fetchDashboardData();
      navigation.setParams({refresh: false});
    }
  }, [route.params?.refresh]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#04366D" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavBar navigation={navigation} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
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

        <Text style={styles.sectionTitle}>Security Model Integrity</Text>
        <View style={styles.card}>
          {['stable', 'suspicious', 'critical'].map((key, i) => {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            const color =
              key === 'critical'
                ? '#FF0000'
                : key === 'suspicious'
                ? '#FFD700'
                : '#4CAF50';
            const value = securityModel[key] || 0;
            return (
              <View style={styles.statusRow} key={i}>
                <Text style={styles.statusText}>{label}</Text>
                <View style={styles.bar}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.max(value, value > 0 ? 1 : 0)}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.statusPercent}>{value}%</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Recent Scam Alerts</Text>
        <View style={styles.card}>
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert, index) => {
              const {
                platform = 'Unknown',
                threatPercentage = 0,
                threatLevel = 'stable',
                scan_id,
                input,
              } = alert;
              const color =
                threatLevel === 'critical'
                  ? '#FF0000'
                  : threatLevel === 'suspicious'
                  ? '#FFD700'
                  : '#4CAF50';

              return (
                <TouchableOpacity
                  key={`${scan_id}-${index}`}
                  style={styles.alertRow}
                  onPress={() =>
                    !isBlocked &&
                    navigation.navigate('Report', {
                      scanId: scan_id,
                      threatCategory: threatLevel,
                      input: input,
                      onGoBack: () => setRefreshTrigger(prev => !prev),
                    })
                  }
                  disabled={isBlocked}>
                  <Text style={styles.alertText}>{platform}</Text>
                  <View style={styles.bar}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.max(threatPercentage, 1)}%`,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.alertPercent}>{threatPercentage}%</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{textAlign: 'center', marginTop: 10}}>
              No recent alerts
            </Text>
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
        onAllowAccess={handleAllowAccess}
      />
    </View>
  );
};

const CircularProgress = ({progress}) => {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});

export default DashboardScreen;
