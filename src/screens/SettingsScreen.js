import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {RadioButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import DeleteFlowModalController from '../modals/DeleteFlowModalController';
import UpdateOtpFlowModal from '../modals/UpdateOtpFlowModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ForgotPasswordModalController from '../modals/ForgotPasswordModalController';

const SettingsScreen = ({navigation}) => {
  const [profileImage, setProfileImage] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [autoDetection, setAutoDetection] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({x: 0, y: 0});
  const [scamAlerts, setScamAlerts] = useState(true);
  const [notificationType, setNotificationType] = useState('popup');
  const [notifyHighRisk, setNotifyHighRisk] = useState(true);
  const [notifyAllSuspicious, setNotifyAllSuspicious] = useState(true);
  const [instantNotification, setInstantNotification] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [soundForScamAlerts, setSoundForScamAlerts] = useState(true);
  const [vibrationOnNotification, setVibrationOnNotification] = useState(true);
  const [deleteReason, setDeleteReason] = useState(null); // Add state for selected reason
  const [otherReason, setOtherReason] = useState(''); // Add state for other reason
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State to control the delete modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTarget, setOtpTarget] = useState(null); // 'email' or 'password'
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernameUpdateMsg, setUsernameUpdateMsg] = useState('');

  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdateMsg, setEmailUpdateMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordUpdateMsg, setPasswordUpdateMsg] = useState('');

  const [otp, setOtp] = useState('');
  const [otpType, setOtpType] = useState('');
  const [otpMsg, setOtpMsg] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // **Handles Image Selection**
  const handleEditProfile = () => {
    launchImageLibrary({mediaType: 'photo', quality: 1}, response => {
      if (response.didCancel) {
        return;
      }
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setModalVisible(false);
  };

  const showEditOptions = event => {
    const {pageX, pageY} = event.nativeEvent;
    setModalPosition({x: pageX, y: pageY});
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <TopNavBar navigation={navigation} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={showEditOptions}>
              <Image
                source={
                  profileImage
                    ? {uri: profileImage}
                    : require('../assets/user.png')
                }
                style={styles.profileImage}
              />
              <View style={styles.editContainer}>
                <Text style={styles.editText}>Edit</Text>
                <Icon name="edit" size={20} color="#04366D" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Expandable Sections */}
          {renderSection(
            'Personal Details',
            'personal',
            expandedSection,
            setExpandedSection,
            () => (
              <View style={styles.sectionContent}>
                {/* Username Update */}
                <Text style={styles.label}>Current Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your current username"
                  value={currentUsername}
                  onChangeText={setCurrentUsername}
                />
                <Text style={styles.label}>New Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your new username"
                  value={newUsername}
                  onChangeText={setNewUsername}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={async () => {
                    try {
                      const token = await AsyncStorage.getItem('token');
                      console.log('Retrieved Token:', token);
                      if (!token) {
                        setUsernameUpdateMsg(
                          'Error: Unauthorized. Please log in.',
                        );
                        return;
                      }

                      const headers = {Authorization: `Bearer ${token}`};
                      const response = await axios.put(
                        'http://localhost:5000/api/account/update-info', // Updated URL
                        {currentUsername, newUsername},
                        {headers},
                      );

                      if (response.status === 200) {
                        setUsernameUpdateMsg('Username updated successfully!');
                        setCurrentUsername('');
                        setNewUsername('');
                      } else {
                        setUsernameUpdateMsg(
                          response.data.error || 'Failed to update username.',
                        );
                      }
                    } catch (error) {
                      if (error.response && error.response.status === 401) {
                        console.error(
                          'Token expired or unauthorized. Redirecting to login.',
                        );
                        setUsernameUpdateMsg(
                          'Session expired. Please log in again.',
                        );
                        // Redirect to login screen
                        navigation.navigate('Login');
                      } else {
                        console.error('Error updating username:', error);
                        setUsernameUpdateMsg(
                          'An error occurred. Please try again.',
                        );
                      }
                    }
                  }}>
                  <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>
                {usernameUpdateMsg ? (
                  <Text style={styles.feedbackMessage}>
                    {usernameUpdateMsg}
                  </Text>
                ) : null}

                {/* Email Update */}
                <Text style={styles.label}>Current Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your current email"
                  value={currentEmail}
                  onChangeText={setCurrentEmail}
                />
                <Text style={styles.label}>New Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your new email"
                  value={newEmail}
                  onChangeText={setNewEmail}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={async () => {
                    try {
                      const token = await AsyncStorage.getItem('token');
                      if (!token) {
                        setEmailUpdateMsg(
                          'Error: Unauthorized. Please log in.',
                        );
                        return;
                      }

                      const headers = {Authorization: `Bearer ${token}`};
                      const response = await axios.post(
                        'http://localhost:5000/api/account/request-otp-update',
                        {type: 'email'},
                        {headers},
                      );

                      if (response.status === 200) {
                        setOtpType('email');
                        setOtpMsg('OTP sent for email update.');
                      } else {
                        setEmailUpdateMsg(
                          response.data.error || 'Failed to request OTP.',
                        );
                      }
                    } catch (error) {
                      console.error('Error requesting OTP:', error);
                      setEmailUpdateMsg('An error occurred. Please try again.');
                    }
                  }}>
                  <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>
                {emailUpdateMsg ? (
                  <Text style={styles.feedbackMessage}>{emailUpdateMsg}</Text>
                ) : null}

                {/* OTP Verification */}
                {otpType === 'email' && (
                  <>
                    <Text style={styles.label}>Enter OTP</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter OTP"
                      value={otp}
                      onChangeText={setOtp}
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={async () => {
                        try {
                          const token = await AsyncStorage.getItem('token');
                          if (!token) {
                            setOtpMsg('Error: Unauthorized. Please log in.');
                            return;
                          }

                          const headers = {Authorization: `Bearer ${token}`};
                          const response = await axios.post(
                            'http://localhost:5000/api/account/verify-update-otp',
                            {otp, type: 'email', currentEmail, newEmail},
                            {headers},
                          );

                          if (response.status === 200) {
                            setOtpMsg('Email updated successfully!');
                            setCurrentEmail('');
                            setNewEmail('');
                            setOtp('');
                            setOtpType('');
                          } else {
                            setOtpMsg(
                              response.data.error || 'Failed to verify OTP.',
                            );
                          }
                        } catch (error) {
                          console.error('Error verifying OTP:', error);
                          setOtpMsg('An error occurred. Please try again.');
                        }
                      }}>
                      <Text style={styles.saveText}>Verify OTP</Text>
                    </TouchableOpacity>
                    {otpMsg ? (
                      <Text style={styles.feedbackMessage}>{otpMsg}</Text>
                    ) : null}
                  </>
                )}
              </View>
            ),
          )}

          {renderSection(
            'Password',
            'password',
            expandedSection,
            setExpandedSection,
            () => (
              <View style={styles.sectionContent}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.inputWithoutBox} // Updated style for the input
                    secureTextEntry={!showCurrentPassword} // Toggle visibility
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)} // Toggle state
                    style={styles.iconContainer} // Style to align the icon to the right
                  >
                    <Icon
                      name={
                        showCurrentPassword ? 'visibility' : 'visibility-off'
                      } // FontAwesome icon
                      size={20}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.inputWithoutBox}
                    secureTextEntry={!showNewPassword}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.iconContainer}>
                    <Icon
                      name={showNewPassword ? 'visibility' : 'visibility-off'}
                      size={20}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={() => setShowForgotPasswordModal(true)} // Show modal
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={async () => {
                    try {
                      const token = await AsyncStorage.getItem('token');
                      if (!token) {
                        setPasswordUpdateMsg(
                          'Error: Unauthorized. Please log in.',
                        );
                        return;
                      }

                      const headers = {Authorization: `Bearer ${token}`};
                      const response = await axios.post(
                        'http://localhost:5000/api/account/request-otp-update',
                        {type: 'password'},
                        {headers},
                      );

                      if (response.status === 200) {
                        setOtpType('password');
                        setOtpMsg('OTP sent for password update.');
                      } else {
                        setPasswordUpdateMsg(
                          response.data.error || 'Failed to request OTP.',
                        );
                      }
                    } catch (error) {
                      console.error('Error requesting OTP:', error);
                      setPasswordUpdateMsg(
                        'An error occurred. Please try again.',
                      );
                    }
                  }}>
                  <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>
                {passwordUpdateMsg ? (
                  <Text style={styles.feedbackMessage}>
                    {passwordUpdateMsg}
                  </Text>
                ) : null}

                {/* OTP Verification */}
                {otpType === 'password' && (
                  <>
                    <Text style={styles.label}>Enter OTP</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter OTP"
                      value={otp}
                      onChangeText={setOtp}
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={async () => {
                        try {
                          const token = await AsyncStorage.getItem('token');
                          if (!token) {
                            setOtpMsg('Error: Unauthorized. Please log in.');
                            return;
                          }

                          const headers = {Authorization: `Bearer ${token}`};
                          const response = await axios.post(
                            'http://localhost:5000/api/account/verify-update-otp',
                            {
                              otp,
                              type: 'password',
                              currentPassword,
                              newPassword,
                            },
                            {headers},
                          );

                          if (response.status === 200) {
                            setOtpMsg('Password updated successfully!');
                            setCurrentPassword('');
                            setNewPassword('');
                            setOtp('');
                            setOtpType('');
                          } else {
                            setOtpMsg(
                              response.data.error || 'Failed to verify OTP.',
                            );
                          }
                        } catch (error) {
                          console.error('Error verifying OTP:', error);
                          setOtpMsg('An error occurred. Please try again.');
                        }
                      }}>
                      <Text style={styles.saveText}>Verify OTP</Text>
                    </TouchableOpacity>
                    {otpMsg ? (
                      <Text style={styles.feedbackMessage}>{otpMsg}</Text>
                    ) : null}
                  </>
                )}
              </View>
            ),
          )}

          {renderSection(
            'Notification',
            'notification',
            expandedSection,
            setExpandedSection,
            () => (
              <View style={styles.sectionContent}>
                {/* Notification Preferences */}
                <Text style={styles.sectionTitles}>
                  Notification Preferences
                </Text>
                <View style={styles.box}>
                  <View style={styles.switchGroup}>
                    <Text style={styles.label}>Scam Alerts</Text>
                    <Switch
                      value={scamAlerts}
                      onValueChange={setScamAlerts}
                      trackColor={{false: '#767577', true: '#04366D'}}
                      thumbColor={scamAlerts ? '#fff' : '#fff'}
                    />
                  </View>

                  <Text style={styles.label}>Notification Type</Text>
                  <View style={styles.radioGroups}>
                    <RadioButton
                      value="popup"
                      status={
                        notificationType === 'popup' ? 'checked' : 'unchecked'
                      }
                      onPress={() => setNotificationType('popup')}
                      color="#04366D"
                    />
                    <Text style={styles.radioText}>Pop Up</Text>
                    <RadioButton
                      value="silent"
                      status={
                        notificationType === 'silent' ? 'checked' : 'unchecked'
                      }
                      onPress={() => setNotificationType('silent')}
                      color="#04366D"
                    />
                    <Text style={styles.radioText}>Silent</Text>
                  </View>
                </View>

                {/* Custom Alerts */}
                <Text style={styles.sectionTitles}>Custom Alerts</Text>
                <View style={styles.box}>
                  <View style={styles.switchGroup}>
                    <Text style={styles.label}>
                      Notify only High-Risk Scams
                    </Text>
                    <Switch
                      value={notifyHighRisk}
                      onValueChange={setNotifyHighRisk}
                      trackColor={{false: '#767577', true: '#04366D'}}
                      thumbColor={notifyHighRisk ? '#fff' : '#fff'}
                    />
                  </View>
                  <View style={styles.switchGroup}>
                    <Text style={styles.label}>
                      Notify for All Suspicious Activity
                    </Text>
                    <Switch
                      value={notifyAllSuspicious}
                      onValueChange={setNotifyAllSuspicious}
                      trackColor={{false: '#767577', true: '#04366D'}}
                      thumbColor={notifyAllSuspicious ? '#fff' : '#fff'}
                    />
                  </View>
                </View>

                {/* Frequency Control */}
                <Text style={styles.sectionTitles}>Frequency Control</Text>
                <View style={styles.box}>
                  <View style={styles.switchGroup}>
                    <Text style={styles.label}>Instant Notification</Text>
                    <Switch
                      value={instantNotification}
                      onValueChange={setInstantNotification}
                      trackColor={{false: '#767577', true: '#04366D'}}
                      thumbColor={instantNotification ? '#fff' : '#fff'}
                    />
                  </View>
                  <View style={styles.switchGroup}>
                    <Text style={styles.label}>Daily Summary Report</Text>
                    <Switch
                      value={dailySummary}
                      onValueChange={setDailySummary}
                      trackColor={{false: '#767577', true: '#04366D'}}
                      thumbColor={dailySummary ? '#fff' : '#fff'}
                    />
                  </View>
                </View>

                {/* Sound & Vibration Settings */}
                <Text style={styles.sectionTitles}>
                  Sound & Vibration Settings
                </Text>
                <View style={styles.box}>
                  <View style={styles.switchGroup}>
                    <Text style={styles.label}>
                      Enable Sound for Scam Alerts
                    </Text>
                    <Switch
                      value={soundForScamAlerts}
                      onValueChange={setSoundForScamAlerts}
                      trackColor={{false: '#767577', true: '#04366D'}}
                      thumbColor={soundForScamAlerts ? '#fff' : '#fff'}
                    />
                  </View>
                  <View style={styles.switchGroup}>
                    <Text style={styles.label}>Vibration on Notification</Text>
                    <Switch
                      value={vibrationOnNotification}
                      onValueChange={setVibrationOnNotification}
                      trackColor={{false: '#767577', true: '#04366D'}}
                      thumbColor={vibrationOnNotification ? '#fff' : '#fff'}
                    />
                  </View>
                </View>

                {/* Save Changes Button */}
                <View style={styles.saveButtonContainer}>
                  <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ),
          )}

          {/* Delete Account Section */}
          {renderSection(
            'Delete Account',
            'deleteAccount',
            expandedSection,
            setExpandedSection,
            () => (
              <View style={styles.sectionContent}>
                <Text style={styles.label}>
                  We are really sorry to see you go. Are you sure you want to
                  delete your account? Once you confirm your data will be gone.
                </Text>

                <View style={styles.radioGroupDelete}>
                  {[
                    { key: 'noLongerUsing', label: 'I am no longer using my account' },
                    { key: 'serviceNotGood', label: 'The service is not good' },
                    { key: 'dontUnderstand', label: "I don't understand how to use" },
                    { key: 'dontNeed', label: "I don't need this app anymore" },
                    { key: 'other', label: 'Other' },
                  ].map(item => (
                    <View style={styles.radioOption} key={item.key}>
                      <RadioButton
                        value={item.key}
                        status={deleteReason === item.key ? 'checked' : 'unchecked'}
                        onPress={() => setDeleteReason(item.key)}
                        color="#04366D"
                      />
                      <Text style={styles.deleteLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                {deleteReason === 'other' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your reason here"
                    value={otherReason}
                    onChangeText={setOtherReason}
                  />
                )}

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={async () => {
                    try {
                      const token = await AsyncStorage.getItem('token');
                      if (!token) {
                        alert('Authentication required');
                        return;
                      }

                      const reason =
                        deleteReason === 'other' && otherReason.trim() !== ''
                          ? otherReason
                          : deleteReason;

                      const response = await axios.post(
                        'http://localhost:5000/api/delete/reason',
                        { reason },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      if (response.status === 200) {
                        setShowDeleteModal(true);
                      } else {
                        alert(response.data.error || 'Failed to save reason.');
                      }
                    } catch (error) {
                      console.error('Error saving delete reason:', error);
                      alert('Something went wrong. Try again.');
                    }
                  }}>
                  <Text style={styles.saveText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            ),
          )}

          {/* Auto Detection */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Auto Detection</Text>
            <Switch value={autoDetection} onValueChange={setAutoDetection} />
          </View>

          {/* Priority Selection */}
          <Text style={styles.priorityLabel}>Priority</Text>
          <View style={styles.radioGroup}>
            <RadioButton
              value="low"
              status={priority === 'low' ? 'checked' : 'unchecked'}
              onPress={() => setPriority('low')}
            />
            <Text style={styles.priority}>Low</Text>
            <RadioButton
              value="medium"
              status={priority === 'medium' ? 'checked' : 'unchecked'}
              onPress={() => setPriority('medium')}
            />
            <Text style={styles.priority}>Medium</Text>
            <RadioButton
              value="high"
              status={priority === 'high' ? 'checked' : 'unchecked'}
              onPress={() => setPriority('high')}
            />
            <Text style={styles.priority}>High</Text>
          </View>

          {/* Dynamic Priority Message */}
          {priority === 'low' && (
            <Text style={styles.priorityText}>
              * Only major threats are flagged, with fewer alerts.
            </Text>
          )}
          {priority === 'medium' && (
            <Text style={styles.priorityText}>
              * A balanced level that detects most scams with less warnings.
            </Text>
          )}
          {priority === 'high' && (
            <Text style={styles.priorityText}>
              * Flags even slight suspicious activity for maximum protection.
            </Text>
          )}

          {/* Help Button */}
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => navigation.navigate('Help')}>
            <Text style={styles.helpText}>Help</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <BottomNavBar navigation={navigation} />

      {/* Modal for Image Options */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}>
          <View
            style={[
              styles.modalContent,
              {top: modalPosition.y, left: modalPosition.x},
            ]}>
            <TouchableOpacity
              style={styles.transparentButton}
              onPress={handleEditProfile}>
              <Icon name="photo-library" size={20} color="#04366D" />
              <Text style={styles.modalButtonText}>Select Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.transparentButton}
              onPress={handleRemoveImage}>
              <Icon name="delete" size={20} color="#04366D" />
              <Text style={styles.modalButtonText}>Remove Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.transparentButton}
              onPress={() => setModalVisible(false)}>
              <Icon name="cancel" size={20} color="#04366D" />
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Delete Account Modal Controller */}
      <DeleteFlowModalController
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* Update otp Modal */}
      <UpdateOtpFlowModal
        visible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onOtpSuccess={() => {
          console.log('Username/email/password updated');
        }}
        skipOtp={otpTarget === 'username'} // skip OTP only for username
      />

      <ForgotPasswordModalController
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)} // Close modal
      />
    </View>
  );
};

// **Reusable Section Component**
const renderSection = (
  title,
  key,
  expandedSection,
  setExpandedSection,
  content,
) => (
  <View>
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => setExpandedSection(expandedSection === key ? null : key)}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Icon
        name={expandedSection === key ? 'expand-less' : 'expand-more'}
        size={20}
        color="#fff"
      />
    </TouchableOpacity>
    {expandedSection === key && content()}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 25,
    paddingBottom: 175,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    justifyContent: 'center',
  },
  editText: {
    color: '#04366D',
    marginRight: 5,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  sectionHeader: {
    backgroundColor: '#04366D',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  sectionContent: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginVertical: 5,
    color: '#04366D',
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpButton: {
    backgroundColor: '#04366D',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  helpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginTop: -45,
    marginLeft: 40,
  },
  transparentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    marginVertical: 5,
    width: '100%',
    backgroundColor: 'transparent',
  },
  modalButtonText: {
    color: '#04366D',
    fontSize: 14,
    marginLeft: 10,
    padding: 0,
    fontFamily: 'Poppins-Regular',
  },
  priorityLabel: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    marginLeft: 10,
    color: '#04366D',
    fontFamily: 'Poppins-Bold',
  },
  priorityText: {
    fontSize: 10,
    color: 'red',
    marginTop: 10,
    fontFamily: 'Poppins-Medium',
    justifyContent: 'left',
    alignItems: 'left',
    textAlign: 'left',
    marginLeft: 10,
  },
  priority: {
    fontSize: 14,
    color: '#04366D',
    fontFamily: 'Poppins-Bold',
    marginLeft: -50,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  radioGroups: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Align items to the start
    marginBottom: 10,
    marginLeft: 0, // Remove excessive left margin
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  sectionHeader: {
    backgroundColor: '#04366D', // Blue background for expandable sections
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitles: {
    color: '#04366D', // White text for section headers (Fixing the issue)
    fontSize: 16,
    fontWeight: 'bold',
  },
  box: {
    backgroundColor: '#E8E8E8', // Light gray box styling
    padding: 12,
    borderRadius: 5,
    marginVertical: 5,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#04366D',
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: '#04366D',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  radioText: {
    fontSize: 14,
    color: '#04366D',
    fontFamily: 'Poppins-Bold',
    marginLeft: 5, // Add small spacing between the radio button and text
    marginRight: 30, // Add spacing between each radio button group
  },
  saveButton: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginLeft: 5, // Add spacing between the radio button and text
  },
  radioGroupDelete: {
    flexDirection: 'column',
    textAlign: 'left',
    marginVertical: 10,
    padding: 5,
  },
  radioOption: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Vertically center the radio button and text
    marginBottom: 10, // Add spacing between options
  },
  feedbackMessage: {
    marginTop: 10,
    fontSize: 14,
    color: '#FF0000', // Red for errors
    fontFamily: 'Poppins-Medium',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff', // Remove border and box styling
  },
  iconContainer: {
    marginRight: 10, // Add spacing between the icon and the input
  },

  inputWithoutBox: {
    flex: 1, // Take up the remaining space
    padding: 10,
    fontSize: 16,
    color: '#000',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#04366D',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
