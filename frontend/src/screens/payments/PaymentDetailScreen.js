import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Card, Text, Button, Divider, useTheme, Portal, Dialog, TextInput } from 'react-native-paper';
import axiosInstance from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentDetailScreen = ({ route, navigation }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const isAdmin = user?.role === 'admin';
  const theme = useTheme();
  
  const [isRejectDialogVisible, setIsRejectDialogVisible] = useState(false);
  const [tempRejectionReason, setTempRejectionReason] = useState('');

  const { paymentId } = route.params;

  useEffect(() => {
    fetchPaymentDetail();
  }, []);

  const fetchPaymentDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`/payments/${paymentId}`);
      setPayment(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/payments/${paymentId}`, { status: newStatus });
      Alert.alert('Success', `Payment marked as ${newStatus}`);
      fetchPaymentDetail();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update payment');
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!tempRejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.patch(`/payments/${paymentId}`, { 
        status: 'Rejected',
        rejectionReason: tempRejectionReason.trim()
      });
      setIsRejectDialogVisible(false);
      setTempRejectionReason('');
      Alert.alert('Success', 'Payment has been rejected and client notified.');
      fetchPaymentDetail();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reject payment');
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await axiosInstance.delete(`/payments/${paymentId}`);
              Alert.alert('Success', 'Payment record deleted');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete payment');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleViewInvoice = () => {
    if (payment?.pdfUrl) {
      Linking.openURL(payment.pdfUrl).catch(() => {
        Alert.alert('Error', 'Could not open invoice');
      });
    }
  };

  if (loading && !payment) {
    return <LoadingSpinner message="Loading payment details..." />;
  }

  if (!payment) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={fetchPaymentDetail} />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>INVOICE #{payment.invoiceNumber || payment._id.slice(-8).toUpperCase()}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.headerCardCustom}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.invoiceLabel}>Invoice Number</Text>
              <Text style={styles.invoiceValue}>#{payment.invoiceNumber || payment._id.slice(-8).toUpperCase()}</Text>
            </View>
            <StatusBadge status={payment.status} />
          </View>
          <Text style={styles.dateText}>
            {new Date(payment.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.content}>
          {payment.status === 'Rejected' && (
            <View style={styles.rejectionAlert}>
              <View style={styles.rejectionHeader}>
                <MaterialIcons name="error-outline" size={20} color="#d32f2f" />
                <Text style={styles.rejectionTitle}>REJECTION FEEDBACK</Text>
              </View>
              <Text style={styles.rejectionText}>{payment.rejectionReason}</Text>
            </View>
          )}

          <View style={styles.amountSectionCustom}>
            <Text style={styles.amountLabel}>Total Amount Paid</Text>
            <Text style={styles.amountValue}>USD {payment.amount?.toLocaleString()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Info</Text>
            <View style={styles.premiumCard}>
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="payments" size={20} color="#012d1d" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.label}>Method</Text>
                  <Text style={styles.value}>{payment.paymentMethod}</Text>
                </View>
              </View>
              <Divider style={styles.innerDivider} />
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="receipt" size={20} color="#012d1d" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.label}>Transaction ID</Text>
                  <Text style={[styles.value, styles.amberText]}>
                    {payment.transactionId || 'N/A'}
                  </Text>
                </View>
              </View>
              {isAdminOrStaff && payment.receiptImage && (
                <>
                  <Divider style={styles.innerDivider} />
                  <TouchableOpacity 
                    style={styles.receiptLink}
                    onPress={() => Linking.openURL(payment.receiptImage)}
                  >
                    <MaterialIcons name="image" size={20} color="#795900" />
                    <Text style={styles.receiptLinkText}>View Transfer Receipt</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {payment.orderId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Linked Order</Text>
              <View style={styles.premiumCard}>
                <View style={styles.infoRow}>
                  <View style={styles.iconCircle}>
                    <MaterialIcons name="shopping-bag" size={20} color="#012d1d" />
                  </View>
                  <View style={styles.infoText}>
                    <Text style={styles.label}>Order ID</Text>
                    <Text style={styles.value}>#{payment.orderId._id?.slice(-8).toUpperCase()}</Text>
                  </View>
                </View>
                {payment.orderId.clientId && (
                  <>
                    <Divider style={styles.innerDivider} />
                    <View style={styles.infoRow}>
                      <View style={styles.iconCircle}>
                        <MaterialIcons name="business" size={20} color="#012d1d" />
                      </View>
                      <View style={styles.infoText}>
                        <Text style={styles.label}>Client</Text>
                        <Text style={styles.value}>{payment.orderId.clientId.companyName}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          <View style={styles.actionButtons}>
            {isAdminOrStaff && payment.status === 'Pending' && (
              <View style={styles.adminActionRow}>
                <Button 
                  mode="contained" 
                  onPress={() => handleUpdateStatus('Paid')}
                  style={[styles.actionBtn, { flex: 1, backgroundColor: '#012d1d' }]}
                  icon="check-circle"
                  labelStyle={styles.btnLabel}
                >
                  Verify
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => setIsRejectDialogVisible(true)}
                  style={[styles.actionBtn, { flex: 1, backgroundColor: '#d32f2f' }]}
                  icon="cancel"
                  labelStyle={styles.btnLabel}
                >
                  Reject
                </Button>
              </View>
            )}

            {payment.pdfUrl && (
              <Button 
                mode="contained" 
                onPress={handleViewInvoice}
                style={[styles.actionBtn, { backgroundColor: '#795900', marginTop: 12 }]}
                icon="file-download"
                labelStyle={styles.btnLabel}
              >
                Download Invoice
              </Button>
            )}

            {isAdmin && (
              <Button 
                mode="outlined" 
                onPress={handleDelete}
                style={[styles.deleteBtn, { marginTop: 24 }]}
                textColor="#d32f2f"
                icon="delete"
                labelStyle={styles.deleteBtnLabel}
              >
                Permanently Delete Record
              </Button>
            )}

            {user?.role === 'client' && (
              <Button 
                mode="outlined" 
                onPress={() => {
                  Alert.alert(
                    'Remove from History',
                    'This will remove the payment from your view. The office will still have a record of this payment.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Remove', 
                        onPress: async () => {
                          try {
                            setLoading(true);
                            await axiosInstance.patch(`/payments/${paymentId}/hide`);
                            Alert.alert('Success', 'Payment removed from your history');
                            navigation.goBack();
                          } catch (err) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to remove payment');
                            setLoading(false);
                          }
                        }
                      }
                    ]
                  );
                }}
                style={[styles.deleteBtn, { marginTop: 24, borderColor: '#6E6E80' }]}
                textColor="#6E6E80"
                icon="eye-off"
                labelStyle={styles.deleteBtnLabel}
              >
                Remove from History
              </Button>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Rejection Dialog */}
      <Portal>
        <Dialog 
          visible={isRejectDialogVisible} 
          onDismiss={() => setIsRejectDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Reject Payment</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogSub}>Please explain why this payment is being rejected. The client will see this message.</Text>
            <TextInput
              label="Rejection Reason"
              value={tempRejectionReason}
              onChangeText={setTempRejectionReason}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.dialogInput}
              activeOutlineColor="#012d1d"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsRejectDialogVisible(false)} textColor="#6E6E80">Cancel</Button>
            <Button 
              onPress={handleReject} 
              mode="contained" 
              buttonColor="#d32f2f"
              style={{ borderRadius: 8 }}
            >
              Confirm Reject
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    height: 60,
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
  headerCardCustom: {
    backgroundColor: '#ffffff',
    padding: 20,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceLabel: {
    fontSize: 11,
    color: '#6E6E80',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  invoiceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#012d1d',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#795900',
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  amountSectionCustom: {
    backgroundColor: '#012d1d',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#012d1d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  amountLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 10,
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
    borderRadius: 14,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#6E6E80',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 15,
    color: '#012d1d',
    fontWeight: '800',
    marginTop: 2,
  },
  amberText: {
    color: '#795900',
  },
  innerDivider: {
    marginVertical: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
  },
  receiptLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(121, 89, 0, 0.05)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  receiptLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#795900',
  },
  actionButtons: {
    marginTop: 10,
    marginBottom: 40,
  },
  actionBtn: {
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
  },
  btnLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  deleteBtn: {
    borderRadius: 18,
    borderColor: 'rgba(211, 47, 47, 0.2)',
    borderWidth: 1.5,
  },
  deleteBtnLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  rejectionAlert: {
    backgroundColor: '#fff5f5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.1)',
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  rejectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#d32f2f',
    letterSpacing: 1,
  },
  rejectionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    fontWeight: '600',
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#012d1d',
    textAlign: 'center',
  },
  dialogSub: {
    fontSize: 14,
    color: '#6E6E80',
    marginBottom: 16,
    textAlign: 'center',
  },
  dialogInput: {
    backgroundColor: '#fcf9f8',
  },
});

export default PaymentDetailScreen;
