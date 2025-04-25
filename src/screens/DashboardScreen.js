import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  AppState,
  BackHandler,
} from 'react-native';
import Svg, {Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import {useFocusEffect} from '@react-navigation/native';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import NotificationAccessPrompt from '../components/NotificationAccessPrompt';
import PermissionHelper from '../utils/PermissionHelper';

const DashboardScreen = ({navigation}) => {
  const [scanProgress, setScanProgress] = useState(0.85);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showAccessPrompt, setShowAccessPrompt] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkNotificationAccess = useCallback(async (forceCheck = false) => {
    console.log('[ACCESS] Starting notification access check', { forceCheck });
    setIsLoading(true);
    try {
      const hasAccess = await PermissionHelper.checkNotificationAccess(forceCheck);
      console.log(`[ACCESS] Result: ${hasAccess}`);
      
      setShowAccessPrompt(prev => {
        if (prev !== !hasAccess) {
          console.log(`[ACCESS] Updating prompt to ${!hasAccess}`);
          return !hasAccess;
        }
        return prev;
      });

      setIsBlocked(!hasAccess);
      return hasAccess;
    } catch (error) {
      console.error('[ACCESS] Check failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check every time the app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        console.log('[APP] App became active - forcing access check');
        await checkNotificationAccess(true);
      }
    });
    return () => subscription.remove();
  }, [checkNotificationAccess]);

  // Check when screen focuses
  useFocusEffect(
    useCallback(() => {
      console.log('[NAV] Screen focused - checking access');
      checkNotificationAccess(true);
    }, [checkNotificationAccess])
  );

  const handleAllowAccess = async () => {
    console.log('[PROMPT] Allow access clicked');
    const success = await PermissionHelper.requestNotificationAccess();
    if (success) {
      // Check repeatedly until access is confirmed
      const checkInterval = setInterval(async () => {
        const hasAccess = await checkNotificationAccess(true);
        if (hasAccess) {
          clearInterval(checkInterval);
        }
      }, 1000);

      // Timeout after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  const handleQuickScan = () => {
    const newProgress = Math.random() * 0.5 + 0.5;
    setScanProgress(newProgress);
  };

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
          {[
            {label: 'Stable', color: 'green', percent: 70},
            {label: 'Suspicious', color: 'yellow', percent: 90},
            {label: 'Critical', color: 'red', percent: 50},
          ].map(({label, color, percent}) => (
            <View style={styles.statusRow} key={label}>
              <Text style={styles.statusText}>{label}</Text>
              <View style={styles.bar}>
                <View
                  style={[
                    styles.progressBar,
                    {width: `${percent}%`, backgroundColor: color},
                  ]}
                />
              </View>
              <Text style={styles.statusPercent}>{percent}%</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Scam Alerts</Text>
        <View style={styles.card}>
          {[
            {label: 'Phishing Attack', color: 'red', percent: 100},
            {label: 'Job Scam', color: 'yellow', percent: 85},
            {label: 'Sampath Bank', color: 'green', percent: 60},
          ].map(({label, color, percent}) => (
            <TouchableOpacity
              style={styles.alertRow}
              key={label}
              onPress={() => !isBlocked && navigation.navigate('Report')}
              disabled={isBlocked}>
              <Text style={styles.alertText}>{label}</Text>
              <View style={styles.bar}>
                <View
                  style={[
                    styles.progressBar,
                    {width: `${percent}%`, backgroundColor: color},
                  ]}
                />
              </View>
              <Text style={styles.alertPercent}>{percent}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNavBar
        navigation={navigation}
        onQuickScan={handleQuickScan}
        disabled={isBlocked}
      />

      <NotificationAccessPrompt
        visible={showAccessPrompt}
        onClose={() => {
          console.log('[PROMPT] User dismissed');
          setShowAccessPrompt(false);
        }}
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
            <Stop offset="40%" stopColor="#04366D" />
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
