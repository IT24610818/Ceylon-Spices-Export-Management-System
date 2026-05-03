import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import axiosInstance from '../../api/axios';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { SegmentedButtons } from 'react-native-paper';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';

const AddClientScreen = ({ route, navigation }) => {
  const { editClient } = route.params || {};
  const isEditing = !!editClient;
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [role, setRole] = useState(editClient?.role || editClient?.userId?.role || 'client');
  const [name, setName] = useState(editClient?.userId?.name || editClient?.name || '');
  const [companyName, setCompanyName] = useState(editClient?.companyName || '');
  const [email, setEmail] = useState(editClient?.email || editClient?.userId?.email || '');
  const [phone, setPhone] = useState(editClient?.phone || '');
  const [country, setCountry] = useState(editClient?.country || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState('LK');

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCountry(country.name);
    setShowCountryPicker(false);
  };

  const isClient = role === 'client';

  const validateForm = () => {
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return false;
    }

    if (isClient && !companyName.trim()) {
      setError('Company name is required');
      return false;
    }

    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return false;
    }

    if (isClient && !country.trim()) {
      setError('Country is required');
      return false;
    }

    if (!isEditing && (!password.trim() || password.length < 6)) {
      setError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        role,
        email: email.toLowerCase().trim(),
        phone: phone.trim() || undefined,
        companyName: isClient ? companyName.trim() : undefined,
        country: isClient ? country.trim() : undefined,
      };

      if (!isEditing) {
        payload.password = password;
        await axiosInstance.post('/clients', payload);
      } else {
        await axiosInstance.put(`/clients/${editClient._id}`, payload);
      }

      Alert.alert('Success', `User ${isEditing ? 'updated' : 'added'} successfully`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} user`);
    } finally {
      setLoading(false);
    }
  };

  const getHeaderTitle = () => {
    const action = isEditing ? 'EDIT' : 'ADD NEW';
    const roleName = role.toUpperCase();
    return `${action} ${roleName} ACCOUNT`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header with Back Button */}
      <View style={styles.headerTopCustom}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#012d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {getHeaderTitle()}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Card.Content>
            {error ? <ErrorMessage message={error} /> : null}

            <Text style={styles.sectionLabel}>ACCOUNT TYPE</Text>
            <SegmentedButtons
              value={role}
              onValueChange={setRole}
              disabled={loading || (isEditing && !isAdmin)}
              buttons={[
                { value: 'client', label: 'Client', checkedColor: '#fff', style: role === 'client' ? { backgroundColor: '#012d1d' } : {} },
                { value: 'staff', label: 'Staff', disabled: !isAdmin, checkedColor: '#fff', style: role === 'staff' ? { backgroundColor: '#012d1d' } : {} },
                { value: 'admin', label: 'Admin', disabled: !isAdmin, checkedColor: '#fff', style: role === 'admin' ? { backgroundColor: '#012d1d' } : {} },
              ]}
              style={styles.segmentedButtons}
            />

            <TextInput
              label="Contact Person Name *"
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              mode="outlined"
              editable={!loading}
              style={styles.input}
              activeOutlineColor="#012d1d"
              outlineColor="rgba(1, 45, 29, 0.1)"
            />

            {isClient && (
              <TextInput
                label="Company Name *"
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Enter company name"
                mode="outlined"
                editable={!loading}
                style={styles.input}
                activeOutlineColor="#012d1d"
                outlineColor="rgba(1, 45, 29, 0.1)"
              />
            )}

            <TextInput
              label="Email Address *"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              mode="outlined"
              keyboardType="email-address"
              editable={!loading}
              style={styles.input}
              activeOutlineColor="#012d1d"
              outlineColor="rgba(1, 45, 29, 0.1)"
            />

            {isClient && (
              <TouchableOpacity 
                onPress={() => setShowCountryPicker(true)}
                style={styles.countryPickerContainer}
              >
                <View style={styles.countryPickerInner}>
                  <Text style={styles.countryLabel}>Country *</Text>
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
            )}

            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              mode="outlined"
              keyboardType="phone-pad"
              editable={!loading}
              style={styles.input}
              activeOutlineColor="#012d1d"
              outlineColor="rgba(1, 45, 29, 0.1)"
            />

            {!isEditing && (
              <TextInput
                label="Account Password *"
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                mode="outlined"
                secureTextEntry
                editable={!loading}
                style={[styles.input, { fontSize: 14 }]}
                activeOutlineColor="#012d1d"
                outlineColor="rgba(1, 45, 29, 0.1)"
              />
            )}

            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              labelStyle={styles.submitButtonLabel}
            >
              {isEditing ? 'UPDATE ACCOUNT' : 'CREATE ACCOUNT'}
            </Button>
          </Card.Content>
        </Card>
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
    height: 100,
    paddingTop: 40,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#012d1d',
    letterSpacing: 2,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: { 
    fontSize: 12, 
    color: '#795900', 
    marginBottom: 12, 
    fontWeight: '800',
    letterSpacing: 1,
  },
  segmentedButtons: { 
    marginBottom: 8,
  },
  input: { 
    marginBottom: 20, 
    backgroundColor: '#fff',
  },
  submitButton: { 
    paddingVertical: 8, 
    backgroundColor: '#012d1d', 
    marginTop: 12, 
    borderRadius: 16,
    shadowColor: '#012d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonLabel: { 
    fontSize: 15, 
    fontWeight: '800',
    letterSpacing: 1,
  },
  countryPickerContainer: {
    marginBottom: 20,
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
    color: '#795900',
    position: 'absolute',
    top: -10,
    left: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    zIndex: 1,
    fontWeight: '800',
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

export default AddClientScreen;
