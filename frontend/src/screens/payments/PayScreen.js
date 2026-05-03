import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { TextInput, Button, Card, Text, useTheme, SegmentedButtons, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const PayScreen = ({ route, navigation }) => {
  const { orderId, amount } = route.params;
  const [method, setMethod] = useState('card');
  const [receiptImage, setReceiptImage] = useState(null);
  
  // Card details
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [loading, setLoading] = useState(false);

  const pickReceipt = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access gallery is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const handlePayment = async () => {
    if (method === 'card' && (!cardHolder || !cardNumber || !expiry || !cvv)) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    if (method === 'bank' && !receiptImage) {
      Alert.alert('Error', 'Please upload a bank transfer receipt/slip');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        orderId,
        amount,
        paymentMethod: method === 'card' ? 'Credit Card' : 'Bank Transfer',
        status: method === 'card' ? 'Paid' : 'Pending',
      };

      const response = await axiosInstance.post(`/payments/simulated-pay`, payload);

      if (response.data.success) {
        const paymentId = response.data.paymentId;

        if (method === 'bank' && receiptImage) {
          try {
            const formData = new FormData();
            const filename = receiptImage.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('image', {
              uri: receiptImage,
              name: filename,
              type: type,
            });

            const token = await AsyncStorage.getItem('authToken');
            const apiUrl = axiosInstance.defaults.baseURL;
            const uploadUrl = `${apiUrl}/payments/${paymentId}/upload-receipt`;

            const uploadResponse = await fetch(uploadUrl, {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });

            if (!uploadResponse.ok) throw new Error('Receipt upload failed');
          } catch (uploadErr) {
            console.error('Receipt upload failed:', uploadErr);
            Alert.alert('Partial Success', 'Payment record created, but receipt upload failed. Please contact support.');
          }
        }

        Alert.alert(
          method === 'card' ? 'Payment Successful' : 'Transfer Recorded',
          method === 'card' 
            ? 'Your payment has been processed successfully.' 
            : 'Your bank transfer record and receipt have been submitted. Our staff will verify it soon.',
          [{ text: 'OK', onPress: () => navigation.navigate('OrderListMain') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#012d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SECURE CHECKOUT</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summarySection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="account-balance-wallet" size={40} color="#012d1d" />
          </View>
          <Text style={styles.amountLabel}>Total Due</Text>
          <Text style={styles.amountValue}>USD {amount?.toLocaleString()}</Text>
          <View style={styles.refBadge}>
            <Text style={styles.orderRef}>REF: #{orderId.slice(-8).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.methodSelector}>
          <TouchableOpacity 
            style={[styles.methodBtn, method === 'card' && styles.methodBtnActive]} 
            onPress={() => setMethod('card')}
          >
            <MaterialIcons name="credit-card" size={20} color={method === 'card' ? '#ffffff' : '#012d1d'} />
            <Text style={[styles.methodLabel, method === 'card' && styles.methodLabelActive]}>Card Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.methodBtn, method === 'bank' && styles.methodBtnActive]} 
            onPress={() => setMethod('bank')}
          >
            <MaterialIcons name="account-balance" size={20} color={method === 'bank' ? '#ffffff' : '#012d1d'} />
            <Text style={[styles.methodLabel, method === 'bank' && styles.methodLabelActive]}>Bank Transfer</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.paymentCard}>
          <Card.Content>
            {method === 'card' ? (
              <View>
                <Text style={styles.cardTitle}>Payment Details</Text>
                
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person-outline" size={20} color="#012d1d" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Cardholder Name"
                    value={cardHolder}
                    onChangeText={setCardHolder}
                    mode="flat"
                    style={styles.textInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    placeholderTextColor="#AEAEB2"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialIcons name="credit-card" size={20} color="#012d1d" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Card Number"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    mode="flat"
                    keyboardType="numeric"
                    style={styles.textInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    placeholderTextColor="#AEAEB2"
                    maxLength={16}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                    <TextInput
                      placeholder="MM/YY"
                      value={expiry}
                      onChangeText={setExpiry}
                      mode="flat"
                      style={styles.textInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      placeholderTextColor="#AEAEB2"
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                    <TextInput
                      placeholder="CVV"
                      value={cvv}
                      onChangeText={setCvv}
                      mode="flat"
                      keyboardType="numeric"
                      secureTextEntry
                      style={styles.textInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      placeholderTextColor="#AEAEB2"
                      maxLength={4}
                    />
                  </View>
                </View>

                <View style={styles.secureNote}>
                  <MaterialIcons name="verified-user" size={16} color="#4caf50" />
                  <Text style={styles.secureText}>256-bit SSL Encrypted Transaction</Text>
                </View>
              </View>
            ) : (
              <View style={styles.bankDetails}>
                <Text style={styles.cardTitle}>Treasury Information</Text>
                <Text style={styles.bankNote}>Please transfer the exact total to our official corporate account.</Text>
                
                <View style={styles.bankInfoBox}>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Institution</Text>
                    <Text style={styles.bankValue}>Ceylon International Bank</Text>
                  </View>
                  <Divider style={styles.bankDivider} />
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Beneficiary</Text>
                    <Text style={styles.bankValue}>Ceylon Spices (PVT) Ltd</Text>
                  </View>
                  <Divider style={styles.bankDivider} />
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Account No</Text>
                    <Text style={[styles.bankValue, { color: '#795900' }]}>8009 1123 4456 7788</Text>
                  </View>
                  <Divider style={styles.bankDivider} />
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>SWIFT</Text>
                    <Text style={styles.bankValue}>CIBL KLCY XXX</Text>
                  </View>
                </View>

                <Text style={styles.uploadTitle}>Confirm with Receipt</Text>
                <TouchableOpacity style={styles.uploadBox} onPress={pickReceipt}>
                  {receiptImage ? (
                    <Image source={{ uri: receiptImage }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <View style={styles.uploadIconCircle}>
                        <MaterialIcons name="camera-alt" size={28} color="#012d1d" />
                      </View>
                      <Text style={styles.uploadPlaceholderText}>Upload Transfer Confirmation</Text>
                      <Text style={styles.uploadPlaceholderSub}>JPG or PNG format</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handlePayment}
              loading={loading}
              disabled={loading}
              style={styles.payButton}
              contentStyle={styles.payButtonContent}
              labelStyle={styles.payButtonLabel}
            >
              {method === 'card' ? `COMPLETE PAYMENT` : 'SUBMIT TRANSFER RECORD'}
            </Button>
          </Card.Content>
        </Card>
        
        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerBar: {
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fcf9f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
    letterSpacing: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  content: {
    padding: 20,
  },
  summarySection: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 32,
    elevation: 3,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 11,
    color: '#6E6E80',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#012d1d',
    marginTop: 4,
  },
  refBadge: {
    backgroundColor: 'rgba(121, 89, 0, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
  },
  orderRef: {
    fontSize: 10,
    color: '#795900',
    fontWeight: '900',
    letterSpacing: 1,
  },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 20,
    marginBottom: 24,
    gap: 6,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  methodBtnActive: {
    backgroundColor: '#012d1d',
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#012d1d',
  },
  methodLabelActive: {
    color: '#ffffff',
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#012d1d',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.05)',
    paddingLeft: 14,
    marginBottom: 16,
    height: 56,
    overflow: 'hidden',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 15,
    fontWeight: '600',
    color: '#012d1d',
  },
  row: {
    flexDirection: 'row',
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    gap: 6,
  },
  secureText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '700',
  },
  payButton: {
    borderRadius: 18,
    backgroundColor: '#012d1d',
    marginTop: 10,
  },
  payButtonContent: {
    height: 56,
  },
  payButtonLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bankInfoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.06)',
    padding: 16,
    marginBottom: 24,
  },
  bankNote: {
    fontSize: 13,
    color: '#6E6E80',
    marginBottom: 16,
    lineHeight: 18,
    fontWeight: '500',
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  bankDivider: {
    backgroundColor: 'rgba(1, 45, 29, 0.04)',
  },
  bankLabel: {
    fontSize: 12,
    color: '#6E6E80',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bankValue: {
    fontSize: 13,
    color: '#012d1d',
    fontWeight: '800',
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#012d1d',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  uploadBox: {
    height: 160,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(1, 45, 29, 0.1)',
    borderStyle: 'dashed',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadPlaceholderText: {
    fontSize: 14,
    color: '#012d1d',
    fontWeight: '800',
  },
  uploadPlaceholderSub: {
    fontSize: 11,
    color: '#AEAEB2',
    marginTop: 4,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  footerSpacing: {
    height: 100,
  },
});

export default PayScreen;
