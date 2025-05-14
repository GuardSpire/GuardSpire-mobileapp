import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';

const ManualScannerScreen = ({ navigation }) => {
  const [scanText, setScanText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [threatLevel, setThreatLevel] = useState(null);
  const [lastScanId, setLastScanId] = useState(null);
  const textInputRef = useRef(null);

  const handleScan = async () => {
    if (!scanText) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanComplete(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      setScanProgress(progress);
    }, 300);

    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/scan/manual',
        { input: scanText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      setLastScanId(data.scan_id);

      clearInterval(interval);
      setIsScanning(false);
      setScanProgress(1);
      setScanComplete(true);

      const threat = data.combined_threat || data.text_analysis || {};
      const normalizedThreatCategory = threat.category || 'Stable';

      setThreatLevel({
        type: normalizedThreatCategory === 'Critical' ? 'Scam Alert' :
              normalizedThreatCategory === 'Suspicious' ? 'Potential Threat' : 'Legitimate',
        level: normalizedThreatCategory === 'Critical' ? 'High' :
               normalizedThreatCategory === 'Suspicious' ? 'Medium' : 'Low',
        status: normalizedThreatCategory,
        percentage: parseFloat(threat.confidence?.toString().replace('%', '') || '0').toFixed(0),
        description: threat.description || 'No description provided.',
        indicators: threat.indicators || [],
        actions: threat.actions || []
      });

    } catch (error) {
      clearInterval(interval);
      setIsScanning(false);
      setScanComplete(false);
      Alert.alert('Error', 'Scan failed. Please try again.');
      console.error('Scan failed:', error.message);
    }
  };

  const getThreatColor = (level) => {
    if (level === 'High') return '#FF0000';
    if (level === 'Medium') return '#FFD700';
    return '#4CAF50';
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <TopNavBar navigation={navigation} />

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={[
            styles.inputBox,
            { borderColor: scanText ? '#04366D' : '#D3D3D3' },
          ]}>
            <TextInput
              ref={textInputRef}
              style={[styles.input, isScanning && styles.inputScanning]}
              placeholder="+ Add a Message or a URL to Scan"
              placeholderTextColor="#888"
              value={scanText}
              onChangeText={setScanText}
              editable={!isScanning}
              onFocus={() => textInputRef.current.focus()}
            />
            {isScanning && (
              <View style={styles.scanBox}>
                <ScanProgress progress={scanProgress} />
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
            <Text style={styles.scanText}>Scan</Text>
          </TouchableOpacity>

          {scanComplete && threatLevel && (
            <View style={styles.resultsBox}>
              <Text style={styles.statusTitle}>Status</Text>
              <View style={styles.card}>
                <View style={styles.statusHeader}>
                  <Text style={styles.threatType}>{threatLevel.type}</Text>
                </View>
                <View style={styles.statusContent}>
                  <View style={styles.threatLevelRow}>
                    <Text style={styles.threatLabel}>Threat Level</Text>
                    <View style={styles.threatLevelContainer}>
                      <View style={styles.threatLevelBarContainerDynamic}>
                        <View style={{
                          height: 10,
                          width: `${threatLevel.percentage}%`,
                          backgroundColor: getThreatColor(threatLevel.level),
                          borderRadius: 5,
                        }} />
                      </View>
                    </View>
                  </View>
                  <View style={styles.statusRow}>
                    <Text style={styles.threatLabel}>Status</Text>
                    <Text style={[
                      styles.threatStatus,
                      { color: getThreatColor(threatLevel.level) }
                    ]}>
                      {threatLevel.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.circularProgressWrapper}>
                  <ThreatLevelProgress
                    progress={parseFloat(threatLevel.percentage) / 100}
                    level={threatLevel.level}
                  />
                </View>
              </View>

              <Text style={styles.detailsTitle}>Alert Details & Insights</Text>
              <View style={styles.card}>
                <Text style={styles.detailsText}>
                  <Text style={styles.boldText}>Alert Type:</Text> {threatLevel.type}
                </Text>
                <Text style={styles.detailsText}>
                  <Text style={styles.boldText}>Threat Level:</Text> {threatLevel.level}
                </Text>
                <Text style={styles.detailsText}>
                  <Text style={styles.boldText}>Description:</Text> {threatLevel.description}
                </Text>
                {threatLevel.indicators.map((item, i) => (
                  <Text key={i} style={styles.detailsText}>• {item}</Text>
                ))}
                {threatLevel.actions.map((item, i) => (
                  <Text key={i} style={styles.detailsText}>• {item}</Text>
                ))}
              </View>

              <TouchableOpacity
                style={styles.moreDetailsButton}
                onPress={() => {
                  if (lastScanId) {
                    navigation.navigate('Report', { 
                      scanId: lastScanId,
                      threatCategory: threatLevel.status,
                      threatPercentage: threatLevel.percentage
                    });
                  } else {
                    Alert.alert('Error', 'Scan report not available');
                  }
                }}
              >
                <Text style={styles.moreDetailsText}>More Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <BottomNavBar navigation={navigation} />
      </View>
    </KeyboardAvoidingView>
  );
};

const ThreatLevelProgress = ({ progress, level }) => {
  const size = 70;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - progress);

  const getThreatColor = () => {
    if (level === 'High') return '#FF0000';
    if (level === 'Medium') return '#FFD700';
    return '#4CAF50';
  };

  const circleColor = getThreatColor();

  return (
    <View style={styles.circularProgressContainerThreatLevel}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#D3D3D3"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={circleColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <Text style={[styles.progressText, { color: circleColor }]}>
        {Math.round(progress * 100)}%
      </Text>
    </View>
  );
};

const ScanProgress = ({ progress }) => {
  const size = 100;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - progress);

  return (
    <View style={styles.circularProgressContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#D3D3D3"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#04366D"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <Text style={styles.scanProgressText}>{Math.round(progress * 100)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  inputBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    height: 250,
    padding: 10,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputScanning: {
    color: '#D3D3D3',
  },
  scanButton: {
    backgroundColor: '#04366D',
    paddingVertical: 12,
    marginVertical: 10,
    borderRadius: 6,
    margin: 50,
    alignItems: 'center',
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  scanBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -50}, {translateY: -50}],
    alignItems: 'center',
  },
  circularProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressContainerThreatLevel: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    marginRight: 25,
    marginTop: 12,
  },
  progressText: {
    position: 'absolute',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  scanProgressText: {
    position: 'absolute',
    color: '#04366D',
    fontSize: 25,
    fontWeight: 'bold',
  },
  resultsBox: {
    marginTop: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#04366D',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#F0EEEE',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  statusHeader: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 4,
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
    margin: 2,
  },
  threatType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContent: {
    flexDirection: 'column',
    justifyContent: 'space-column',
    alignItems: 'right',
  },
  threatLevelRow: {
    flexDirection: 'row',
    justifyContent: 'right',
    alignItems: 'center',
    marginBottom: 10,
    margin: 5,
  },
  threatLevelContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 15,
    marginTop: 5,
    width: '40%',
  },
  threatLevelBarContainerDynamic: {
    height: 10,
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
  },
  threatLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    justifyContent: 'space-between',
    color: '#333',
    marginBottom: 5,
  },
  threatStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    justifyContent: 'space-between',
    marginLeft: 54,
    marginBottom: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'right',
    alignItems: 'center',
    textAlign: 'right',
    margin: 5,
    marginBottom: 10,
  },
  circularProgressWrapper: {
    width: 60,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
  },
  detailsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#04366D',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    marginLeft: 10,
    fontFamily: 'Poppins-Medium',
  },
  boldText: {
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
    fontSize: 15,
  },
  moreDetailsButton: {
    backgroundColor: '#04366D',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'right',
    justifyContent: 'right',
    left: 100,
    margin: 100,
    marginTop: 0,
    marginBottom: 0,
  },
  moreDetailsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
});

export default ManualScannerScreen;