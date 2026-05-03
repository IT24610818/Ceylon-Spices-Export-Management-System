import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Text, TextInput as PaperTextInput, ProgressBar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import axiosInstance from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const EditDocumentScreen = ({ route, navigation }) => {
  const { documentId } = route.params;

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Invoice');
  const [orderId, setOrderId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [documentId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [docRes, ordersRes] = await Promise.all([
        axiosInstance.get(`/documents/${documentId}`),
        axiosInstance.get('/orders')
      ]);

      const doc = docRes.data.data || docRes.data;
      setTitle(doc.title);
      setType(doc.type);
      setOrderId(doc.orderId?._id || '');
      setOrders(ordersRes.data.data || []);
      
    } catch (err) {
      setError('Failed to load document details for editing');
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          mime: asset.mimeType || 'application/octet-stream'
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      setError('Document title is required');
      return;
    }

    try {
      setUpdating(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('type', type);
      formData.append('orderId', orderId || '');

      if (selectedFile) {
        formData.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mime || 'application/octet-stream',
        });
      }

      await axiosInstance.put(`/documents/${documentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.loaded / progressEvent.total;
          setUploadProgress(progress);
        },
      });

      Alert.alert('Success', 'Document updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update document');
    } finally {
      setUpdating(false);
      setUploadProgress(0);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#012d1d" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>DOCUMENTS</Text>
          <Text style={styles.headerTitle}>EDIT DOCUMENT</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {error ? <ErrorMessage message={error} /> : null}

        {/* General Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Document Title *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="title" size={18} color="#012d1d" style={styles.inputIcon} />
              <PaperTextInput
                value={title}
                onChangeText={setTitle}
                mode="flat"
                style={styles.textInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="e.g. Quality Certificate"
                placeholderTextColor="#b0b0b0"
                editable={!updating}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Document Type</Text>
            <View style={styles.pickerWrapper}>
              <MaterialIcons name="category" size={18} color="#012d1d" style={styles.inputIcon} />
              <Picker
                selectedValue={type}
                onValueChange={setType}
                style={styles.picker}
                enabled={!updating}
              >
                <Picker.Item label="Invoice" value="Invoice" />
                <Picker.Item label="Packing List" value="Packing List" />
                <Picker.Item label="Certificate" value="Certificate" />
                <Picker.Item label="Bill of Lading" value="Bill of Lading" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Related Order</Text>
            <View style={styles.pickerWrapper}>
              <MaterialIcons name="receipt" size={18} color="#012d1d" style={styles.inputIcon} />
              <Picker
                selectedValue={orderId}
                onValueChange={setOrderId}
                style={styles.picker}
                enabled={!updating}
              >
                <Picker.Item label="No specific order" value="" color="#b0b0b0" />
                {orders.map((order) => (
                  <Picker.Item
                    key={order._id}
                    label={`Order #${order._id.slice(-6).toUpperCase()}`}
                    value={order._id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* File Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Document File (Optional)</Text>
          <Text style={styles.helpText}>Only select a file if you want to replace the current version.</Text>
          
          <TouchableOpacity 
            style={[styles.filePicker, selectedFile && styles.filePickerSelected]}
            onPress={handlePickFile}
            disabled={updating}
            activeOpacity={0.7}
          >
            <View style={[styles.uploadIconCircle, selectedFile && { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <MaterialIcons 
                name={selectedFile ? "verified" : "cloud-upload"} 
                size={32} 
                color={selectedFile ? "#4caf50" : "#012d1d"} 
              />
            </View>
            <Text style={[styles.filePickerText, selectedFile && { color: '#012d1d' }]}>
              {selectedFile ? selectedFile.name : "Tap to select new version"}
            </Text>
            {selectedFile && (
              <Text style={styles.fileSize}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {updating && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Updating Document</Text>
              <Text style={styles.progressPercent}>{Math.round(uploadProgress * 100)}%</Text>
            </View>
            <ProgressBar progress={uploadProgress} color="#012d1d" style={styles.progressBar} />
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.submitButton, updating && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={updating}
          activeOpacity={0.85}
        >
          {updating ? (
            <Text style={styles.submitButtonText}>Saving...</Text>
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 100,
    paddingTop: 40,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fcf9f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#795900',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#012d1d',
    letterSpacing: 1,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#012d1d',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  helpText: {
    fontSize: 11,
    color: '#6E6E80',
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E6E80',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.12)',
    paddingLeft: 14,
    overflow: 'hidden',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.12)',
    paddingLeft: 14,
    height: 54,
  },
  picker: {
    flex: 1,
    marginLeft: -8,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#1a1a1a',
    height: 50,
  },
  filePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(1, 45, 29, 0.15)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  filePickerSelected: {
    borderColor: '#4caf50',
    backgroundColor: 'rgba(76, 175, 80, 0.02)',
    borderStyle: 'solid',
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  filePickerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6E6E80',
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6E6E80',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '900',
    color: '#012d1d',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#012d1d',
    borderRadius: 20,
    paddingVertical: 18,
    gap: 10,
    marginTop: 8,
    shadowColor: '#012d1d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

export default EditDocumentScreen;
