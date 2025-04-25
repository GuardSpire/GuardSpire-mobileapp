import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';

const ManualScannerScreen = ({navigation}) => {
  const [scanText, setScanText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [threatLevel, setThreatLevel] = useState(null);
  const textInputRef = useRef(null);

  // Simulate Scan Process
  const handleScan = () => {
    if (!scanText) {return;}
    setIsScanning(true);
    setScanProgress(0);
    setScanComplete(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      setScanProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
        setIsScanning(false);
        setScanComplete(true);

        // Simulating scan results
        setThreatLevel({
          type: 'Phishing Attack',
          level: 'High',
          status: 'Critical',
          percentage: '100%',
        });
      }
    }, 300);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* Top Navigation Bar */}
        <TopNavBar navigation={navigation} />

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Input Box */}
          <View
            style={[
              styles.inputBox,
              {borderColor: scanText ? '#04366D' : '#D3D3D3'},
            ]}>
            <TextInput
              ref={textInputRef}
              style={[styles.input, isScanning && styles.inputScanning]}
              placeholder="+ Add a Message or a URL to Scan"
              placeholderTextColor="#888"
              value={scanText}
              onChangeText={setScanText}
              editable={!isScanning}
              onFocus={() => textInputRef.current.focus()} // Ensure the TextInput is focused
            />
            {isScanning && (
              <View style={styles.scanBox}>
                <ScanProgress progress={scanProgress} />
              </View>
            )}
          </View>

          {/* Scan Button */}
          <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
            <Text style={styles.scanText}>Scan</Text>
          </TouchableOpacity>

          {/* Scan Results */}
          {scanComplete && (
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
                      <View style={styles.threatLevelBarContainer}>
                        <View
                          style={[
                            styles.threatLevelBar,
                            {backgroundColor: 'green', width: '33%'},
                          ]}
                        />
                        <View
                          style={[
                            styles.threatLevelBar,
                            {backgroundColor: 'yellow', width: '33%'},
                          ]}
                        />
                        <View
                          style={[
                            styles.threatLevelBar,
                            {backgroundColor: 'red', width: '34%'},
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.statusRow}>
                    <Text style={styles.threatLabel}>Status</Text>
                    <Text style={styles.threatStatus}>
                      {threatLevel.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.circularProgressWrapper}>
                  <ThreatLevelProgress progress={1} />
                </View>
              </View>

              {/* Alert Details & Insights */}
              <Text style={styles.detailsTitle}>Alert Details & Insights</Text>
              <View style={styles.card}>
                <Text style={styles.detailsText}>
                  <Text style={styles.boldText}>Alert Type:</Text>{' '}
                  {threatLevel.type}
                </Text>
                <Text style={styles.detailsText}>
                  <Text style={styles.boldText}>Threat Level:</Text>{' '}
                  {threatLevel.level}
                </Text>
                <Text style={styles.detailsText}>
                  <Text style={styles.boldText}>Description:</Text> This website
                  appears to impersonate a legitimate e-commerce platform and
                  may be designed to steal login credentials, payment details,
                  or personal information.
                </Text>
              </View>

              {/* More Details Button */}
              <TouchableOpacity
                style={styles.moreDetailsButton}
                onPress={() => navigation.navigate('Report')}>
                <Text style={styles.moreDetailsText}>More Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNavBar navigation={navigation} />
      </View>
    </KeyboardAvoidingView>
  );
};

/* Threat Level Progress Component */
const ThreatLevelProgress = ({progress}) => {
  const size = 70; // Reduced size
  const strokeWidth = 8; // Reduced stroke width
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - progress);

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
          stroke="#FF0000" // Red color for the progress circle
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
    </View>
  );
};

/* Scan Progress Component */
const ScanProgress = ({progress}) => {
  const size = 100; // Increased size
  const strokeWidth = 10; // Increased stroke width
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
          stroke="#04366D" // Blue color for the progress circle
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

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between', // Ensure content is spaced correctly
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
    color: '#D3D3D3', // Light color when scanning
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
    position: 'absolute', // Center the scan box
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
    color: '#FF0000', // Red color for the progress text
    fontSize: 13, // Reduced font size
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  scanProgressText: {
    position: 'absolute',
    color: '#04366D', // Blue color for the progress text
    fontSize: 25, // Increased font size
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
  threatLevelBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  threatLevelBar: {
    height: '100%',
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
    color: 'red',
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
  detailsBox: {
    backgroundColor: '#F0EEEE',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
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
