import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';

const ReportScreen = ({navigation}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Mock scam report data
  const scamData = {
    type: 'Phishing Scam',
    platform: 'Online Shopping (Daraz Impersonation)',
    url: 'daraz-lk-offer.com',
    threatLevel: 'High',
    description:
      'This website appears to impersonate Daraz, a legitimate e-commerce platform, in order to deceive and steal login credentials, payment details, or personal information by luring users with fake discounts, promotions or giveaways.',
    indicators: [
      'The site does not match the official Daraz domain.',
      'The website may request sensitive information such as bank details or passwords.',
      'Offers and discounts appear too good to be true.',
      'Unusual design or unusual pop-ups asking for personal information.',
    ],
    actions: [
      'Do not enter any personal or payment details.',
      'Close the website immediately and do not click on any links.',
      'Report the phishing attempt to Daraz and internet cybersecurity authorities.',
      'If any details were entered, immediately reset passwords and monitor financial transactions.',
    ],
    threatPercentage: 1, // Example percentage (75%)
  };

  const getThreatLevel = percentage => {
    if (percentage >= 0.75) {
      return 'Critical';
    } else if (percentage >= 0.5) {
      return 'High';
    } else if (percentage >= 0.25) {
      return 'Medium';
    } else {
      return 'Low';
    }
  };

  const threatLevel = getThreatLevel(scamData.threatPercentage);

  // Function to handle report button click
  const handleReportSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Success', 'Scam reported successfully!');
    }, 1500); // Simulating a short delay
  };

  const handleFeedback = isValid => {
    if (isValid) {
      setFeedbackMessage(
        'Thank you for confirming. Rest assured, we are working to secure your account and prevent any further issues.',
      );
    } else {
      setFeedbackMessage(
        "Thank you for your feedback. We'll review this alert and refine our detection system.",
      );
    }
    setModalVisible(true);
  };

  const ThreatLevelProgress = ({progress}) => {
    const size = 48;
    const strokeWidth = 5;
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
            stroke="#FF0000"
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

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <TopNavBar navigation={navigation} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Phishing Attack</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{threatLevel}</Text>
            <ThreatLevelProgress progress={scamData.threatPercentage} />
          </View>
        </View>

        {/* Scam Details Card */}
        <View style={styles.card}>
          <Text style={styles.boldText}>Alert Type:</Text>
          <Text style={styles.infoText}>{scamData.type}</Text>

          <Text style={styles.boldText}>Affected Platform:</Text>
          <Text style={styles.infoText}>{scamData.platform}</Text>

          <Text style={styles.boldText}>Suspicious URL:</Text>
          <Text style={styles.infoText}>{scamData.url}</Text>

          <Text style={styles.boldText}>Threat Level:</Text>
          <Text style={styles.infoText}>{scamData.threatLevel}</Text>

          <Text style={styles.boldText}>Description:</Text>
          <Text style={styles.infoText}>{scamData.description}</Text>

          <Text style={styles.boldText}>Indicators of Phishing:</Text>
          {scamData.indicators.map((indicator, index) => (
            <Text key={index} style={styles.infoText}>
              - {indicator}
            </Text>
          ))}

          <Text style={styles.boldText}>Recommended Actions:</Text>
          {scamData.actions.map((action, index) => (
            <Text key={index} style={styles.infoText}>
              - {action}
            </Text>
          ))}
        </View>

        {/* Block & Report Button */}
        <View style={styles.reportButtonContainer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReportSubmit}
            disabled={isSubmitting}>
            <Text style={styles.reportButtonText}>
              {isSubmitting ? 'Reporting...' : 'Block & Report'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Feedbacks</Text>
          <Text style={styles.feedbackQuestion}>
            Do you think this alert is valid or a false alarm?
          </Text>
          <Text style={styles.feedbackNote}>
            Your feedback helps improve our detection system.
          </Text>
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

      {/* Feedback Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thank you for your feedback</Text>
            <Text style={styles.modalMessage}>{feedbackMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <BottomNavBar navigation={navigation} />
    </View>
  );
};

/* Styles */
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
    color: 'red',
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
    color: 'red',
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
  feedbackNote: {
    fontSize: 12,
    color: '#333',
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