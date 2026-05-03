import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card, Text, Button, Divider, useTheme, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const { width } = Dimensions.get('window');

const DocumentDetailScreen = ({ route, navigation }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const theme = useTheme();
  const { user } = useAuth();
  const { documentId } = route.params;
  
  const isEditable = user?.role === 'staff' || user?.role === 'admin';
  const isDeletable = user?.role === 'admin' || user?.role === 'staff';

  useFocusEffect(
    useCallback(() => {
      fetchDocumentDetail();
    }, [documentId])
  );

  const fetchDocumentDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`/documents/${documentId}`);
      const docData = response.data.data || response.data;
      setDocument(docData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load document details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          onPress: performDelete, 
          style: 'destructive' 
        },
      ]
    );
  };

  const performDelete = async () => {
    try {
      setDeleting(true);
      await axiosInstance.delete(`/documents/${documentId}`);
      Alert.alert('Deleted', 'Document has been removed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const handleHide = () => {
    Alert.alert(
      'Remove from My View',
      'This document will be hidden from your list, but the office will keep a copy for records.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          onPress: async () => {
            try {
              setDeleting(true);
              await axiosInstance.patch(`/documents/${documentId}/hide`);
              Alert.alert('Success', 'Document removed from your view');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to remove document');
            } finally {
              setDeleting(false);
            }
          }
        },
      ]
    );
  };

  const handleViewFile = async () => {
    if (document?.fileUrl) {
      let url = document.fileUrl;
      if (url.startsWith('/uploads')) {
        url = axiosInstance.defaults.baseURL.replace('/api/v1', '') + url;
      }
      
      try {
        await WebBrowser.openBrowserAsync(url);
      } catch (err) {
        Alert.alert('Error', 'Could not open this file type');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Opening document details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDocumentDetail} />;
  if (!document) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header */}
      <View style={styles.headerTopCustom}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#012d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          DOCUMENT: {document.title.toUpperCase()}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.headerCardCustom}>
          <View style={styles.headerTop}>
            <View style={styles.iconCircleLarge}>
              <MaterialIcons name="insert-drive-file" size={32} color="#012d1d" />
            </View>
            <View style={styles.headerTextInfo}>
              <Text style={styles.mainTitle}>{document.title}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={document.type} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Details</Text>
            <View style={styles.premiumCard}>
              <View style={styles.infoGrid}>
                <InfoItem icon="category" label="Type" value={document.type} />
                <InfoItem icon="event" label="Uploaded" value={new Date(document.uploadDate).toLocaleDateString()} />
                <Divider style={styles.innerDividerFull} />
                <InfoItem icon="person" label="Issuer" value={document.uploadedBy?.name || 'Authorized Staff'} />
                {document.orderId && (
                  <InfoItem 
                    icon="receipt" 
                    label="Order Ref" 
                    value={`#${document.orderId._id?.slice(-8).toUpperCase()}`} 
                    color="#795900"
                  />
                )}
              </View>

              <Divider style={styles.innerDivider} />

              <Button
                mode="contained"
                icon="eye"
                onPress={handleViewFile}
                style={styles.primaryButton}
                labelStyle={styles.btnLabel}
              >
                View Digital Document
              </Button>
            </View>
          </View>

          {isEditable && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Management</Text>
              <View style={styles.premiumCard}>
                <Button 
                  mode="outlined"
                  icon="pencil"
                  onPress={() => navigation.navigate('EditDocument', { documentId: document._id })}
                  style={styles.editButton}
                  textColor="#012d1d"
                  labelStyle={styles.btnLabelSmall}
                >
                  Edit Document Details
                </Button>

                {isDeletable && (
                  <Button
                    mode="outlined"
                    icon="delete-outline"
                    onPress={handleDelete}
                    loading={deleting}
                    disabled={deleting}
                    style={styles.deleteButton}
                    textColor="#d32f2f"
                    labelStyle={styles.btnLabelSmall}
                  >
                    Delete Permanently
                  </Button>
                )}
              </View>
            </View>
          )}

          {user?.role === 'client' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.premiumCard}>
                <Button 
                  mode="outlined"
                  icon="eye-off"
                  onPress={handleHide}
                  loading={deleting}
                  disabled={deleting}
                  style={[styles.deleteButton, { borderColor: '#6E6E80' }]}
                  textColor="#6E6E80"
                  labelStyle={styles.btnLabelSmall}
                >
                  Remove from My View
                </Button>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem = ({ icon, label, value, color = '#012d1d' }) => (
  <View style={styles.infoItem}>
    <View style={styles.iconCircleSmall}>
      <MaterialIcons name={icon} size={18} color="#795900" />
    </View>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  </View>
);

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
    fontSize: 14,
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
  headerCardCustom: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  headerTextInfo: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#012d1d',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  premiumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(121, 89, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#6E6E80',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  innerDividerFull: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    marginVertical: 16,
  },
  innerDivider: {
    marginVertical: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: '#012d1d',
    height: 54,
    justifyContent: 'center',
  },
  editButton: {
    borderRadius: 16,
    borderColor: 'rgba(1, 45, 29, 0.2)',
    borderWidth: 1.5,
    marginBottom: 12,
  },
  deleteButton: {
    borderRadius: 16,
    borderColor: 'rgba(211, 47, 47, 0.2)',
    borderWidth: 1.5,
  },
  btnLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnLabelSmall: {
    fontSize: 13,
    fontWeight: '800',
  },
});

export default DocumentDetailScreen;
