import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { TextInput as PaperTextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import CountryPicker from 'react-native-country-picker-modal';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/ErrorMessage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('client');

  // Form Fields
  const [name, setName] = useState(''); 
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState('LK');

  const { register } = useAuth();

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCountry(country.name);
    setShowCountryPicker(false);
  };

  const validateForm = () => {
    setError('');
    if (role === 'client') {
      if (!companyName.trim()) { setError('Company Name is required'); return false; }
      if (!contactPerson.trim()) { setError('Contact Person is required'); return false; }
      if (!email.trim()) { setError('Email is required'); return false; }
      if (!country.trim()) { setError('Country is required'); return false; }
      if (!password.trim()) { setError('Password is required'); return false; }
    } else {
      if (!name.trim()) { setError('Full Name is required'); return false; }
      if (!email.trim()) { setError('Email is required'); return false; }
      if (!password.trim()) { setError('Password is required'); return false; }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Please enter a valid email'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    const displayName = role === 'client' ? companyName : name;
    const additionalData = role === 'client' ? { companyName, contactPerson, phone, country } : {};
    const result = await register(displayName, email.toLowerCase(), password, role, additionalData);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please log in to continue.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      setError(result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>JOIN US</Text>
            <Text style={styles.brandTagline}>CREATE ACCOUNT</Text>
          </View>

          <View style={styles.formCard}>
            {error ? <ErrorMessage message={error} /> : null}

            <View style={styles.roleContainer}>
              <Text style={styles.inputLabel}>I am registering as a:</Text>
              <SegmentedButtons
                value={role}
                onValueChange={setRole}
                buttons={[
                  { value: 'client', label: 'Client' },
                  { value: 'staff', label: 'Staff' },
                  { value: 'admin', label: 'Admin' },
                ]}
                theme={{ colors: { secondaryContainer: '#012d1d', onSecondaryContainer: '#fff' } }}
                style={styles.segmentedButtons}
              />
            </View>

            {role === 'client' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Company Name *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="business" size={18} color="#012d1d" style={styles.inputIcon} />
                    <PaperTextInput
                      value={companyName}
                      onChangeText={setCompanyName}
                      mode="flat"
                      placeholder="Enter company name"
                      style={styles.textInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      disabled={loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Person *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="person-outline" size={18} color="#012d1d" style={styles.inputIcon} />
                    <PaperTextInput
                      value={contactPerson}
                      onChangeText={setContactPerson}
                      mode="flat"
                      placeholder="Enter contact name"
                      style={styles.textInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      disabled={loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="alternate-email" size={18} color="#012d1d" style={styles.inputIcon} />
                    <PaperTextInput
                      value={email}
                      onChangeText={setEmail}
                      mode="flat"
                      placeholder="Enter email"
                      style={styles.textInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      disabled={loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="phone-iphone" size={18} color="#012d1d" style={styles.inputIcon} />
                    <PaperTextInput
                      value={phone}
                      onChangeText={setPhone}
                      mode="flat"
                      placeholder="Enter phone number"
                      style={styles.textInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      keyboardType="phone-pad"
                      disabled={loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Country *</Text>
                  <TouchableOpacity 
                    onPress={() => setShowCountryPicker(true)}
                    style={styles.countryPickerContainer}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="public" size={18} color="#012d1d" style={styles.inputIcon} />
                    <View style={styles.countryPickerInner}>
                      <CountryPicker
                        countryCode={countryCode}
                        withFilter
                        withFlag
                        withCountryNameButton
                        withAlphaFilter
                        withEmoji
                        onSelect={onSelectCountry}
                        visible={showCountryPicker}
                        onClose={() => setShowCountryPicker(false)}
                        containerButtonStyle={{ display: 'none' }} 
                      />
                      <Text style={[styles.countryValueText, !country && { color: '#b0b0b0' }]}>
                        {country || 'Select Country'}
                      </Text>
                    </View>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#012d1d" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="account-circle" size={18} color="#012d1d" style={styles.inputIcon} />
                    <PaperTextInput
                      value={name}
                      onChangeText={setName}
                      mode="flat"
                      placeholder="Enter full name"
                      style={styles.textInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      disabled={loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="alternate-email" size={18} color="#012d1d" style={styles.inputIcon} />
                    <PaperTextInput
                      value={email}
                      onChangeText={setEmail}
                      mode="flat"
                      placeholder="Enter email"
                      style={styles.textInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      disabled={loading}
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password *</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" size={18} color="#012d1d" style={styles.inputIcon} />
                <PaperTextInput
                  value={password}
                  onChangeText={setPassword}
                  mode="flat"
                  placeholder="Min. 6 characters"
                  style={styles.textInput}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  secureTextEntry={!showPassword}
                  disabled={loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color="#6E6E80" 
                    style={styles.eyeIcon} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Creating Account...' : 'CREATE ACCOUNT'}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already a member?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#012d1d',
    letterSpacing: 4,
  },
  brandTagline: {
    fontSize: 9,
    fontWeight: '800',
    color: '#795900',
    letterSpacing: 2,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  roleContainer: {
    marginBottom: 24,
  },
  segmentedButtons: {
    marginTop: 8,
    backgroundColor: '#fcf9f8',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#795900',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.08)',
    paddingLeft: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 14,
    color: '#012d1d',
  },
  eyeIcon: {
    padding: 10,
  },
  submitButton: {
    backgroundColor: '#012d1d',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#012d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6E6E80',
    fontWeight: '600',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '900',
    color: '#795900',
  },
  countryPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.08)',
    paddingHorizontal: 14,
    height: 52,
  },
  countryPickerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryValueText: {
    fontSize: 14,
    color: '#012d1d',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default RegisterScreen;
