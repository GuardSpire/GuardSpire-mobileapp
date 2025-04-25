import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the icon library

const DeleteFlowModalController = ({visible, onClose}) => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isOtpCorrect, setIsOtpCorrect] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const correctPassword = '123456';
  const correctOtp = '7890';

  const resetAll = () => {
    setStep(1);
    setPassword('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setAttempts(0);
    setIsOtpCorrect(false);
    setOtpError(false);
    setPasswordError(false);
    onClose();
  };

  const handlePasswordCheck = () => {
    if (password === correctPassword) {
      setPasswordError(false);
      setStep(step + 1);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 2) {
        setStep(3); // Go to email step
        setPasswordError(false);
      } else {
        setPasswordError(true);
      }
    }
  };

  const handleOtpVerify = () => {
    if (otp === correctOtp) {
      setOtpError(false);
      setIsOtpCorrect(true);
    } else {
      setOtpError(true);
    }
  };

  const handleFinalDelete = () => {
    if (password === correctPassword) {
      setStep(7);
    } else {
      setPasswordError(true);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ModalView title="Are you sure you want to delete your account?">
            <ActionButtons onCancel={resetAll} onConfirm={() => setStep(2)} />
          </ModalView>
        );
      case 2:
        return (
          <PasswordInputModal
            title="Confirm Password"
            value={password}
            onChange={setPassword}
            onConfirm={handlePasswordCheck}
            onForgot={() => setStep(3)}
            error={passwordError}
          />
        );
      case 3:
        return <EmailInputModal onConfirm={() => setStep(4)} />;
      case 4:
        return (
          <InfoModal
            message="We have sent a one-time password to your email. Enter it in the password box."
            onOk={() => setStep(5)}
          />
        );
      case 5:
        return (
          <OtpAndResetPasswordModal
            otp={otp}
            onOtpChange={setOtp}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onVerify={handleOtpVerify}
            isOtpCorrect={isOtpCorrect}
            otpError={otpError}
            onNext={() => setStep(6)}
          />
        );
      case 6:
        return (
          <PasswordInputModal
            title="Confirm Password"
            value={password}
            onChange={setPassword}
            onConfirm={handleFinalDelete}
            error={passwordError}
            onForgot={() => setStep(3)}
          />
        );
      case 7:
        return (
          <InfoModal
            message="Your account has been successfully deleted. Thank You!"
            onOk={resetAll}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={resetAll}>
        <View style={styles.deleteOverlay}>
          <TouchableWithoutFeedback>{renderStep()}</TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ========== Modal Components ==========

const ModalView = ({title, children}) => (
  <View style={styles.deleteModalBox}>
    {title !== '' && <Text style={styles.deleteModalTitle}>{title}</Text>}
    {children}
  </View>
);

const ActionButtons = ({onCancel, onConfirm}) => (
  <View style={styles.deleteButtonRow}>
    <TouchableOpacity style={styles.deleteBtnCancel} onPress={onCancel}>
      <Text style={styles.deleteBtnText}>Back</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.deleteBtnConfirm} onPress={onConfirm}>
      <Text style={styles.deleteBtnText}>Yes</Text>
    </TouchableOpacity>
  </View>
);

const PasswordInputModal = ({
  title,
  value,
  onChange,
  onConfirm,
  onForgot,
  error,
}) => (
  <ModalView title={title}>
    <TextInput
      placeholder="Enter your password"
      secureTextEntry
      style={styles.deleteInput}
      value={value}
      onChangeText={onChange}
    />
    {error && (
      <View>
        <Text style={styles.deleteError}>Re-enter the password</Text>
      </View>
    )}
    <View style={styles.deleteForgot}>
      <TouchableOpacity onPress={onForgot}>
        <Text style={styles.deleteForgot}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity style={styles.deleteBtnConfirm} onPress={onConfirm}>
      <Text style={styles.deleteBtnText}>Confirm</Text>
    </TouchableOpacity>
  </ModalView>
);

const EmailInputModal = ({onConfirm}) => {
  const [email, setEmail] = useState('');
  return (
    <ModalView title="Confirm Email">
      <TextInput
        placeholder="Enter your email"
        style={styles.deleteInput}
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.deleteBtnConfirm} onPress={onConfirm}>
        <Text style={styles.deleteBtnText}>Confirm</Text>
      </TouchableOpacity>
    </ModalView>
  );
};

const InfoModal = ({message, onOk}) => (
  <ModalView title="">
    <Text style={styles.deleteInfo}>{message}</Text>
    <TouchableOpacity style={styles.deleteBtnConfirm} onPress={onOk}>
      <Text style={styles.deleteBtnText}>Ok</Text>
    </TouchableOpacity>
  </ModalView>
);

const OtpAndResetPasswordModal = ({
  otp,
  onOtpChange,
  newPassword,
  confirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onVerify,
  isOtpCorrect,
  otpError,
  onNext,
}) => (
  <ModalView title="Password">
    <Text style={styles.deleteLabel}>Current Password</Text>
    <TextInput
      placeholder="Enter One-Time Password"
      style={styles.deleteUnderlineInput}
      value={otp}
      onChangeText={onOtpChange}
    />
    {otpError && (
      <Text style={styles.deleteError}>Incorrect OTP. Try again.</Text>
    )}
    {isOtpCorrect && (
      <View style={styles.otpVerifiedContainer}>
        <Icon name="check-circle" size={20} color="green" />
        <Text style={styles.deleteSuccess}>OTP Verified</Text>
      </View>
    )}

    <TouchableOpacity style={styles.deleteBtnOrange} onPress={onVerify}>
      <Text style={styles.deleteBtnText}>Verify</Text>
    </TouchableOpacity>

    {isOtpCorrect && (
      <>
        <Text style={styles.deleteLabel}>New Password</Text>
        <TextInput
          placeholder="Enter new password"
          style={styles.deleteUnderlineInput}
          secureTextEntry
          value={newPassword}
          onChangeText={onNewPasswordChange}
        />
        <Text style={styles.deleteLabel}>Confirm Password</Text>
        <TextInput
          placeholder="Re-enter new password"
          style={styles.deleteUnderlineInput}
          secureTextEntry
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
        />
        <TouchableOpacity style={styles.deleteSaveBtnConfirm} onPress={onNext}>
          <Text style={styles.deleteBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </>
    )}
  </ModalView>
);

// ========== Styles ==========
const styles = StyleSheet.create({
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#04366D',
    marginBottom: 10,
    textAlign: 'center',
  },
  deleteInput: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  deleteUnderlineInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    paddingVertical: 8,
    marginBottom: 10,
  },
  deleteLabel: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#04366D',
    marginTop: 20,
    marginBottom: 10,
  },
  deleteButtonRow: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'space-between',
    width: '100%',
  },
  deleteBtnCancel: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    marginHorizontal: 15,
    width: '35%',
    alignItems: 'center',
    marginTop: 15,
  },
  deleteBtnConfirm: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    marginHorizontal: 15,
    width: '35%',
    alignItems: 'center',
    marginTop: 15,
  },
  deleteBtnOrange: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    marginVertical: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  deleteSaveBtnConfirm: {
    backgroundColor: '#04366D',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    marginVertical: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteInfo: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  deleteError: {
    color: 'red',
    fontSize: 12,
    marginRight: 160,
    marginBottom: 5,
  },
  deleteSuccess: {
    color: 'green',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 15,
  },
  deleteForgot: {
    fontSize: 12,
    color: '#007BFF',
    alignSelf: 'flex-end', // Align to the right
    marginBottom: 10,
    marginTop: 5,
  },
  otpVerifiedContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start', // Ensure the container itself aligns to the left
    marginBottom: 10,
  },
});

export default DeleteFlowModalController;
