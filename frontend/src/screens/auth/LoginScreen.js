import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { TextInput as PaperTextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/ErrorMessage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');
    const result = await login(email.toLowerCase().trim(), password);
    setLoading(false);

    if (!result.success) {
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
            <Text style={styles.brandTitle}>CEYLON SPICES</Text>
            <Text style={styles.brandTagline}>EXECUTIVE PORTAL</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to manage your export operations</Text>

            {error ? <ErrorMessage message={error} /> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="alternate-email" size={20} color="#012d1d" style={styles.inputIcon} />
                <PaperTextInput
                  value={email}
                  onChangeText={setEmail}
                  mode="flat"
                  placeholder="Enter your email"
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
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" size={20} color="#012d1d" style={styles.inputIcon} />
                <PaperTextInput
                  value={password}
                  onChangeText={setPassword}
                  mode="flat"
                  placeholder="Enter password"
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
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>{loading ? 'Verifying...' : 'SIGN IN'}</Text>
              {!loading && <MaterialIcons name="arrow-forward" size={20} color="#fff" />}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to our network?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ height: 40 }} />
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
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#012d1d',
    letterSpacing: 4,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#795900',
    letterSpacing: 2,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#012d1d',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6E6E80',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#795900',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.08)',
    paddingLeft: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 14,
    color: '#012d1d',
  },
  eyeIcon: {
    padding: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#012d1d',
    borderRadius: 18,
    height: 60,
    gap: 12,
    marginTop: 12,
    shadowColor: '#012d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6E6E80',
    fontWeight: '600',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '900',
    color: '#795900',
  },
});

export default LoginScreen;
