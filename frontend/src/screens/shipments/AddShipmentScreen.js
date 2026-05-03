import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Text, TextInput as PaperTextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../api/axios';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AddShipmentScreen = ({ navigation }) => {
  const [orderId, setOrderId] = useState('');
  const [shippingMethod, setShippingMethod] = useState('Air');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [departurePort, setDeparturePort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [estimatedDelivery, setEstimatedDelivery] = useState(new Date());
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showDeliveryPicker, setShowDeliveryPicker] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApprovedOrders();
  }, []);

  const fetchApprovedOrders = async () => {
    try {
      setError('');
      const response = await axiosInstance.get('/orders?status=Approved');
      setOrders(response.data.data || []);
    } catch (err) {
      setError('Failed to load approved orders');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    setError('');
    if (!orderId) { setError('Please select an order'); return false; }
    if (!carrier.trim()) { setError('Carrier is required'); return false; }
    if (!trackingNumber.trim()) { setError('Tracking number is required'); return false; }
    if (!departurePort.trim()) { setError('Departure port is required'); return false; }
    if (!destinationPort.trim()) { setError('Destination port is required'); return false; }
    if (estimatedDelivery <= departureDate) { setError('Delivery must be after departure'); return false; }
    return true;
  };

  const handleAddShipment = async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      await axiosInstance.post('/shipments', {
        orderId,
        shippingMethod,
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim(),
        departurePort: departurePort.trim(),
        destinationPort: destinationPort.trim(),
        departureDate,
        estimatedDelivery,
      });

      Alert.alert('Success', 'Shipment added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add shipment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (event, selectedDate, setter, visibilitySetter) => {
    visibilitySetter(false);
    if (selectedDate) setter(selectedDate);
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
          <Text style={styles.headerLabel}>LOGISTICS</Text>
          <Text style={styles.headerTitle}>ADD SHIPMENT</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {error ? <ErrorMessage message={error} /> : null}

        {/* Order Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link Order</Text>
          <View style={styles.pickerWrapper}>
            <MaterialIcons name="shopping-bag" size={18} color="#012d1d" style={styles.inputIcon} />
            <Picker
              selectedValue={orderId}
              onValueChange={setOrderId}
              style={styles.picker}
              enabled={!submitting && orders.length > 0}
            >
              <Picker.Item label="Select Approved Order..." value="" color="#b0b0b0" />
              {orders.map((order) => (
                <Picker.Item
                  key={order._id}
                  label={`Order #${order._id.slice(-6).toUpperCase()} - ${order.clientId?.companyName || 'Private'}`}
                  value={order._id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Shipment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipment Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Carrier *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="business" size={18} color="#012d1d" style={styles.inputIcon} />
              <PaperTextInput
                value={carrier}
                onChangeText={setCarrier}
                mode="flat"
                style={styles.textInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="e.g. FedEx, DHL, Maersk"
                placeholderTextColor="#b0b0b0"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tracking Number *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="track-changes" size={18} color="#012d1d" style={styles.inputIcon} />
              <PaperTextInput
                value={trackingNumber}
                onChangeText={setTrackingNumber}
                mode="flat"
                style={styles.textInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="Enter tracking ID"
                placeholderTextColor="#b0b0b0"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Shipping Method</Text>
            <View style={styles.pickerWrapper}>
              <MaterialIcons name="airplanemode-active" size={18} color="#012d1d" style={styles.inputIcon} />
              <Picker
                selectedValue={shippingMethod}
                onValueChange={setShippingMethod}
                style={styles.picker}
                enabled={!submitting}
              >
                <Picker.Item label="Air Freight" value="Air" />
                <Picker.Item label="Sea Freight" value="Sea" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Ports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Departure Port *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="location-on" size={18} color="#012d1d" style={styles.inputIcon} />
              <PaperTextInput
                value={departurePort}
                onChangeText={setDeparturePort}
                mode="flat"
                style={styles.textInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="e.g. Colombo Port"
                placeholderTextColor="#b0b0b0"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Destination Port *</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="flag" size={18} color="#012d1d" style={styles.inputIcon} />
              <PaperTextInput
                value={destinationPort}
                onChangeText={setDestinationPort}
                mode="flat"
                style={styles.textInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="e.g. Port of Rotterdam"
                placeholderTextColor="#b0b0b0"
              />
            </View>
          </View>
        </View>

        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowDeparturePicker(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="calendar-today" size={16} color="#012d1d" />
              <View>
                <Text style={styles.dateLabel}>DEPARTURE</Text>
                <Text style={styles.dateValue}>{departureDate.toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowDeliveryPicker(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="event-available" size={16} color="#012d1d" />
              <View>
                <Text style={styles.dateLabel}>EST. DELIVERY</Text>
                <Text style={styles.dateValue}>{estimatedDelivery.toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {showDeparturePicker && (
            <DateTimePicker
              value={departureDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => handleDateChange(e, d, setDepartureDate, setShowDeparturePicker)}
            />
          )}

          {showDeliveryPicker && (
            <DateTimePicker
              value={estimatedDelivery}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => handleDateChange(e, d, setEstimatedDelivery, setShowDeliveryPicker)}
            />
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
          onPress={handleAddShipment}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <Text style={styles.submitButtonText}>Creating Shipment...</Text>
          ) : (
            <>
              <MaterialIcons name="local-shipping" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Confirm Shipment</Text>
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
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.08)',
    gap: 10,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6E6E80',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#012d1d',
    marginTop: 2,
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

export default AddShipmentScreen;
