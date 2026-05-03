import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Card, Text, Button, Divider, ProgressBar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';


const ShipmentDetailScreen = ({ route, navigation }) => {
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newDeliveryDate, setNewDeliveryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { user } = useAuth();
  const { shipmentId } = route.params;
  const isEditable = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'staff';

  const statuses = ['Processing', 'Dispatched', 'In Transit', 'Customs Clearance', 'Delivered'];

  useEffect(() => {
    fetchShipmentDetail();
  }, []);

  useEffect(() => {
    if (shipment) {
      setNewStatus(shipment.status);
      setNewDeliveryDate(new Date(shipment.estimatedDelivery));
    }
  }, [shipment]);

  const fetchShipmentDetail = async () => {
    try {
      setError('');
      const response = await axiosInstance.get(`/shipments/${shipmentId}`);
      setShipment(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    const statusChanged = newStatus !== shipment.status;
    const dateChanged = new Date(newDeliveryDate).getTime() !== new Date(shipment.estimatedDelivery).getTime();

    if (!statusChanged && !dateChanged) {
      Alert.alert('Info', 'No changes made to status or date');
      return;
    }

    try {
      setUpdating(true);
      await axiosInstance.patch(`/shipments/${shipmentId}`, {
        status: newStatus,
        estimatedDelivery: newDeliveryDate,
      });

      Alert.alert('Success', 'Shipment status updated', [
        {
          text: 'OK',
          onPress: () => fetchShipmentDetail(),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteShipment = () => {
    Alert.alert(
      'Confirm Permanent Delete',
      'Are you sure you want to permanently delete this shipment record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              await axiosInstance.delete(`/shipments/${shipmentId}`);
              Alert.alert('Success', 'Shipment record has been permanently removed.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete shipment');
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const getProgressValue = () => {
    const currentIndex = statuses.indexOf(shipment?.status);
    return currentIndex >= 0 ? (currentIndex + 1) / statuses.length : 0;
  };

  if (loading) {
    return <LoadingSpinner message="Loading shipment details..." />;
  }

  if (!shipment) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={fetchShipmentDetail} />
      </View>
    );
  }

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
          TRACKING: {shipment.trackingNumber}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {error ? <ErrorMessage message={error} /> : null}

        <View style={styles.headerCardCustom}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.orderLabel}>ORDER REFERENCE</Text>
              <Text style={styles.orderValue}>#{shipment.orderId?._id?.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>{shipment.shippingMethod}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Shipment Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.statusRow}>
                <MaterialIcons name="local-shipping" size={24} color="#012d1d" />
                <Text style={styles.currentStatus}>{shipment.status.toUpperCase()}</Text>
              </View>
              <ProgressBar
                progress={getProgressValue()}
                color="#795900"
                style={styles.progressBar}
              />
              <View style={styles.progressLabels}>
                <Text style={styles.progressPerc}>{Math.round(getProgressValue() * 100)}% Complete</Text>
                <Text style={styles.estDelivery}>Est. {new Date(shipment.estimatedDelivery).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Logistics Details</Text>
            <View style={styles.premiumCard}>
              <InfoRow icon="flight-takeoff" label="Departure Port" value={shipment.departurePort} />
              <Divider style={styles.innerDivider} />
              <InfoRow icon="flight-land" label="Destination Port" value={shipment.destinationPort} />
              <Divider style={styles.innerDivider} />
              <InfoRow icon="business" label="Carrier" value={shipment.carrier} />
              <Divider style={styles.innerDivider} />
              <InfoRow icon="event" label="Departure Date" value={new Date(shipment.departureDate).toLocaleDateString()} />
            </View>
          </View>

          {isEditable && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Update Status</Text>
              <View style={styles.premiumCard}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newStatus}
                    onValueChange={setNewStatus}
                    enabled={!updating}
                    mode="dropdown"
                    style={styles.picker}
                  >
                    {statuses.map((s) => (
                      <Picker.Item key={s} label={s} value={s} />
                    ))}
                  </Picker>
                </View>

                {/* Date Picker Button */}
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateSelectorBtn}
                >
                  <View style={styles.dateSelectorInner}>
                    <MaterialIcons name="event" size={20} color="#795900" />
                    <Text style={styles.dateSelectorText}>
                      EST. DELIVERY: {newDeliveryDate?.toLocaleDateString()}
                    </Text>
                    <MaterialIcons name="edit" size={16} color="#012d1d" />
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={newDeliveryDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setNewDeliveryDate(date);
                    }}
                  />
                )}

                <Button
                  mode="contained"
                  onPress={handleUpdateStatus}
                  loading={updating}
                  disabled={updating}
                  style={styles.updateButton}
                  labelStyle={styles.btnLabel}
                >
                  Update Progress
                </Button>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milestone Timeline</Text>
            <View style={styles.premiumCard}>
              {statuses.map((status, idx) => {
                const isComplete = statuses.indexOf(shipment.status) >= idx;
                const isLast = idx === statuses.length - 1;
                return (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineCircle, isComplete && styles.circleComplete]} />
                      {!isLast && <View style={[styles.timelineLine, isComplete && styles.lineComplete]} />}
                    </View>
                    <Text style={[styles.timelineLabel, isComplete && styles.labelComplete]}>{status}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Delete Action for Admin/Qualified Staff */}
          {(user?.role?.toLowerCase() === 'admin' || (user?.role?.toLowerCase() === 'staff' && shipment.status === 'Delivered')) && (
            <View style={[styles.section, { marginTop: 10 }]}>
              <Button
                mode="contained"
                onPress={handleDeleteShipment}
                loading={updating}
                disabled={updating}
                style={[styles.updateButton, { backgroundColor: '#d32f2f' }]}
                icon="delete-forever"
                labelStyle={styles.btnLabel}
              >
                Permanently Delete Shipment
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconCircle}>
      <MaterialIcons name={icon} size={20} color="#012d1d" />
    </View>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 10,
    color: '#6E6E80',
    fontWeight: '800',
    letterSpacing: 1,
  },
  orderValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#012d1d',
    marginTop: 2,
  },
  methodBadge: {
    backgroundColor: 'rgba(121, 89, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#795900',
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  progressSection: {
    marginBottom: 28,
  },
  progressCard: {
    backgroundColor: '#012d1d',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#012d1d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  currentStatus: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressPerc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '700',
  },
  estDelivery: {
    fontSize: 12,
    color: '#ffdfa0',
    fontWeight: '800',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    fontSize: 15,
    color: '#012d1d',
    fontWeight: '800',
    marginTop: 2,
  },
  innerDivider: {
    marginVertical: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
  },
  pickerContainer: {
    backgroundColor: '#fcf9f8',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(1, 45, 29, 0.05)',
  },
  updateButton: {
    backgroundColor: '#012d1d',
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
  },
  btnLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  timelineLeft: {
    width: 30,
    alignItems: 'center',
  },
  timelineCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E1E4E8',
    zIndex: 1,
  },
  circleComplete: {
    backgroundColor: '#795900',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E1E4E8',
    marginTop: -2,
  },
  lineComplete: {
    backgroundColor: '#795900',
  },
  timelineLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#AEAEB2',
    marginTop: -2,
    marginLeft: 12,
    paddingBottom: 25,
  },
  labelComplete: {
    color: '#012d1d',
  },
  dateSelectorBtn: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  dateSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSelectorText: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 13,
    fontWeight: '800',
    color: '#012d1d',
    letterSpacing: 0.5,
  },
});

export default ShipmentDetailScreen;
