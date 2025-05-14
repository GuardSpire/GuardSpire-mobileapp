import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Modal, ActivityIndicator,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';

const ReportScreen = ({ navigation, route }) => {
  const { scanId, threatCategory: initialThreatCategory, input, onGoBack } = route.params || {};
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      if (!scanId) return;

      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/scan/manual/report/${scanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to fetch');

        const normalizedThreatCategory = initialThreatCategory || 
                                      data.threatCategory || 
                                      'Stable';
        
        const normalizedData = {
          ...data,
          input: input || data.input,
          threatCategory: normalizedThreatCategory.charAt(0).toUpperCase() + 
                         normalizedThreatCategory.slice(1).toLowerCase()
        };
        
        setScanData(normalizedData);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to load scan report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [scanId, initialThreatCategory, input]);

  const handleReportSubmit = async () => {
    if (!scanId) return;
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(
        `http://localhost:5000/api/scan/manual/report/${scanId}/report`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to report');

      setFeedbackMessage('Scam has been successfully reported and blocked.');
      setModalVisible(true);

      // 🔄 Trigger refresh in parent component
      if (onGoBack) onGoBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedback = async (isValid) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`http://localhost:5000/api/scan/manual/feedback/${scanId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: isValid,
          input: scanData.input,
          original_category: scanData.threatCategory,
        }),
      });
      setFeedbackMessage(
        isValid
          ? 'Thank you for confirming. We are working to secure your account.'
          : "Thank you for your feedback. We'll review this alert."
      );
      setModalVisible(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit feedback.');
    }
  };

  const ThreatLevelProgress = ({ progress, color }) => {
    const size = 48;
    const strokeWidth = 5;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - progress);

    return (
      <View style={styles.circularProgressContainer}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} stroke="#D3D3D3" strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>
        <Text style={[styles.progressText, { color }]}>{Math.round(progress * 100)}%</Text>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#04366D" />;
  if (!scanData) return <Text>Scan data not available</Text>;

  const percent = typeof scanData.threatPercentage === 'string'
    ? parseFloat(scanData.threatPercentage.replace('%', '')) || 0
    : (scanData.threatPercentage || 0) * 100;

  const normalizedThreatCategory = scanData.threatCategory.toLowerCase();
  
  const level =
    normalizedThreatCategory === 'critical' ? 'High' :
    normalizedThreatCategory === 'suspicious' ? 'Medium' : 'Low';

  const ringColor =
    level === 'High' ? '#FF0000' :
    level === 'Medium' ? '#FFD700' : '#4CAF50';

  const type =
    normalizedThreatCategory === 'critical' ? 'Scam Alert' :
    normalizedThreatCategory === 'suspicious' ? 'Potential Threat' : 'Legitimate';

  return (
    <View style={styles.container}>
      <TopNavBar navigation={navigation} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{type}</Text>
          <View style={styles.badgeContainer}>
            <Text style={[styles.badgeText, { color: ringColor }]}>{scanData.threatCategory}</Text>
            <ThreatLevelProgress progress={percent / 100} color={ringColor} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.boldText}>Alert Type:</Text>
          <Text style={styles.infoText}>{type}</Text>
          <Text style={styles.boldText}>Input:</Text>
          <Text style={styles.infoText}>{scanData.input}</Text>
          <Text style={styles.boldText}>Threat Level:</Text>
          <Text style={styles.infoText}>{level}</Text>
          <Text style={styles.boldText}>Description:</Text>
          <Text style={styles.infoText}>{scanData.description || 'No description provided.'}</Text>
          {(scanData.indicators || []).map((item, i) => (
            <Text key={i} style={styles.infoText}>• {item}</Text>
          ))}
          {(scanData.actions || []).map((item, i) => (
            <Text key={i} style={styles.infoText}>• {item}</Text>
          ))}
        </View>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleReportSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.reportButtonText}>
            {isSubmitting ? 'Reporting...' : 'Block & Report'}
          </Text>
        </TouchableOpacity>

        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Feedback</Text>
          <Text style={styles.feedbackQuestion}>Is this alert accurate?</Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity onPress={() => handleFeedback(true)}>
              <Text style={styles.feedbackButtonTextLink}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFeedback(false)}>
              <Text style={styles.feedbackButtonTextLink}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thanks!</Text>
            <Text style={styles.modalMessage}>{feedbackMessage}</Text>
            <TouchableOpacity 
              onPress={() => {
                setModalVisible(false);
                if (onGoBack) onGoBack(); // refresh parent list
                navigation.goBack();
              }}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
  },
  backButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#04366D',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  circularProgressContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#F0EEEE',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#04366D',
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  reportButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  reportButton: {
    backgroundColor: '#04366D',
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  feedbackContainer: {
    backgroundColor: '#F0EEEE',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    marginTop: 20,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#04366D',
    marginBottom: 5,
  },
  feedbackQuestion: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  feedbackButtonTextLink: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#04366D',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ReportScreen;