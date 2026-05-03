import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Card, Text, Avatar, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountryPicker from 'react-native-country-picker-modal';

const ProfileScreen = ({ navigation }) => {
  const { user, updateUser, logout } = useAuth(); 
  
  // Profile Details State
  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [error, setError] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState('LK');

  const isClient = user?.role === 'client';

  // Refresh user data when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshUserData();
    }, [])
  );

  const refreshUserData = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      updateUser(response.data);
    } catch (err) {
      console.error('Failed to refresh profile data:', err);
    }
  };

  // Sync state with user context if it updates (e.g. after login/me)
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCompanyName(user.companyName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCountry(user.country || '');
      setProfilePhoto(user.profilePhoto || null);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to access your gallery.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open gallery');
    }
  };

  const uploadPhoto = async (uri) => {
    try {
      setLoading(true);
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('photo', {
        uri: uri,
        name: filename,
        type: type,
      });

      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = axiosInstance.defaults.baseURL;
      
      const response = await fetch(`${apiUrl}/auth/profile/photo`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        const newPhoto = result.profilePhoto;
        setProfilePhoto(newPhoto);
        await updateUser({ profilePhoto: newPhoto });
        Alert.alert('Success', 'Profile photo updated');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCountry(country.name);
    setShowCountryPicker(false);
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.put('/auth/profile', {
        name,
        companyName,
        phone,
        country,
      });

      await updateUser({ name, companyName, phone, country });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters');
      return;
    }

    try {
      setPwdLoading(true);
      await axiosInstance.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      Alert.alert(
        'Success', 
        'Password changed successfully. Please log in again with your new password.',
        [{ text: 'OK', onPress: () => logout() }]
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Premium Header */}
      <View style={styles.headerTopCustom}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#012d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY PROFILE</Text>
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Logout', onPress: logout }])}
        >
          <MaterialIcons name="logout" size={22} color="#d32f2f" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo Card */}
        <View style={styles.avatarCard}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <Avatar.Text 
                size={110} 
                label={name.substring(0, 2).toUpperCase()} 
                style={styles.avatarText} 
                color="#ffffff"
              />
            )}
            <View style={styles.editBadge}>
              <MaterialIcons name="camera-alt" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.roleBadge}>
            <MaterialIcons name="verified" size={14} color="#795900" />
            <Text style={styles.roleText}>{user?.role === 'client' ? 'PREMIUM BUYER' : user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.premiumCard}>
            {error ? <ErrorMessage message={error} /> : null}
            
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              outlineColor="rgba(1, 45, 29, 0.1)"
              activeOutlineColor="#012d1d"
            />

            <TextInput
              label="Email Address"
              value={email}
              mode="outlined"
              disabled
              style={[styles.input, { backgroundColor: '#fcf9f8' }]}
              outlineColor="rgba(1, 45, 29, 0.1)"
            />

            {isClient && (
              <>
                <TextInput
                  label="Company Name"
                  value={companyName}
                  onChangeText={setCompanyName}
                  mode="outlined"
                  style={styles.input}
                  outlineColor="rgba(1, 45, 29, 0.1)"
                  activeOutlineColor="#012d1d"
                />
                <TextInput
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={styles.input}
                  outlineColor="rgba(1, 45, 29, 0.1)"
                  activeOutlineColor="#012d1d"
                />
                <TouchableOpacity 
                  onPress={() => setShowCountryPicker(true)}
                  style={styles.countryPickerContainer}
                >
                  <View style={styles.countryPickerInner}>
                    <Text style={styles.countryLabel}>Country</Text>
                    <View style={styles.countryValueRow}>
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
                      <Text style={styles.countryValueText}>{country || 'Select Country'}</Text>
                      <MaterialIcons name="arrow-drop-down" size={24} color="#012d1d" />
                    </View>
                  </View>
                </TouchableOpacity>
              </>
            )}

            <Button
              mode="contained"
              onPress={handleUpdate}
              loading={loading}
              disabled={loading}
              style={styles.primaryButton}
              labelStyle={styles.btnLabel}
            >
              Update Profile
            </Button>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Password</Text>
          <View style={styles.premiumCard}>
            {pwdError ? <ErrorMessage message={pwdError} /> : null}
            
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              outlineColor="rgba(1, 45, 29, 0.1)"
              activeOutlineColor="#012d1d"
            />

            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              outlineColor="rgba(1, 45, 29, 0.1)"
              activeOutlineColor="#012d1d"
            />

            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              outlineColor="rgba(1, 45, 29, 0.1)"
              activeOutlineColor="#012d1d"
            />

            <Button
              mode="outlined"
              onPress={handleChangePassword}
              loading={pwdLoading}
              disabled={pwdLoading}
              style={styles.secondaryButton}
              textColor="#795900"
              labelStyle={styles.btnLabel}
            >
              Change Password
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerTopCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 65,
    paddingTop: 5,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
  },
  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
    letterSpacing: 2,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  avatarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarText: {
    backgroundColor: '#012d1d',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#795900',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(121, 89, 0, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 16,
    gap: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#795900',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6E6E80',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  premiumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#012d1d',
    height: 54,
    justifyContent: 'center',
  },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 16,
    borderColor: 'rgba(121, 89, 0, 0.2)',
    borderWidth: 1.5,
    height: 54,
    justifyContent: 'center',
  },
  btnLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  countryPickerContainer: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(1, 45, 29, 0.1)',
    backgroundColor: '#ffffff',
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  countryPickerInner: {
    flex: 1,
    justifyContent: 'center',
  },
  countryLabel: {
    fontSize: 12,
    color: '#6E6E80',
    position: 'absolute',
    top: -10,
    left: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    zIndex: 1,
    fontWeight: '700',
  },
  countryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  countryValueText: {
    fontSize: 14,
    color: '#012d1d',
    fontWeight: '600',
    flex: 1,
  },
});

export default ProfileScreen;
