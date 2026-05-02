import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Card, Text, Divider, Button, useTheme } from 'react-native-paper';
import axiosInstance from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

const OrderDetailScreen = ({ route, navigation }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { orderId } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const isClient = user?.role === 'client';
  
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    fetchRelatedDocuments();
  }, [orderId]);

  const fetchRelatedDocuments = async () => {
    try {
      setDocsLoading(true);
      const response = await axiosInstance.get(`/documents?orderId=${orderId}`);
      // Based on my controller update, it returns documents array directly or as { data }
      setDocuments(response.data.data || response.data || []);
    } catch (err) {
      console.error('Failed to load related documents:', err);
    } finally {
      setDocsLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.productId?.name || 'Spice Product'}</Text>
        <Text style={styles.productGrade}>{item.productId?.grade || 'Premium Grade'}</Text>
      </View>
      <View style={styles.productPriceInfo}>
        <Text style={styles.itemQty}>{item.quantity} {item.productId?.unit || 'kg'}</Text>
        <Text style={styles.itemPrice}>USD {item.price?.toLocaleString() || item.unitPrice?.toLocaleString()}</Text>
      </View>
    </View>
  );

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/orders/${orderId}/status`, { status: newStatus });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      fetchOrderDetails();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
      setLoading(false);
    }
  };

  const handleHide = () => {
    Alert.alert(
      'Remove from View',
      'This will remove the order from your list, but it will still be kept in the system records. Continue?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Remove', 
          onPress: async () => {
            try {
              setLoading(true);
              await axiosInstance.patch(`/orders/${orderId}/hide`);
              Alert.alert('Success', 'Order removed from your view', [
                { text: 'OK', onPress: () => navigation.navigate('OrderListMain') }
              ]);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to remove order');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handlePermanentDelete = () => {
    Alert.alert(
      'PERMANENT DELETE',
      'This will completely wipe this order from the entire system. This cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'DELETE PERMANENTLY', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await axiosInstance.delete(`/orders/${orderId}`);
              Alert.alert('Deleted', 'Order permanently removed from system', [
                { text: 'OK', onPress: () => navigation.navigate('OrderListMain') }
              ]);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete order');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            if (isClient) {
              try {
                setLoading(true);
                await axiosInstance.patch(`/orders/${orderId}/cancel`);
                Alert.alert('Success', 'Order cancelled successfully');
                fetchOrderDetails();
              } catch (err) {
                Alert.alert('Error', err.response?.data?.message || 'Failed to cancel order');
                setLoading(false);
              }
            } else {
              updateStatus('Cancelled');
            }
          }
        }
      ]
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOrderDetails} />;
  if (!order) return null;

  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';

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
          ORDER #{order._id.slice(-8).toUpperCase()}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderIdValue}>#{order._id.slice(-8).toUpperCase()}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>
          <Text style={styles.orderDate}>
            Placed on {new Date(order.createdAt || order.orderDate || Date.now()).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        <View style={styles.content}>
          {isAdminOrStaff && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manage Order Status</Text>
              <View style={styles.glassCard}>
                <View style={styles.statusButtonsGrid}>
                  {order.status === 'Pending' && (
                    <>
                      <Button 
                        mode="contained" 
                        onPress={() => updateStatus('Approved')}
                        style={[styles.statusBtn, { backgroundColor: '#1b4332' }]}
                        icon="check-circle"
                        labelStyle={styles.btnLabel}
                      >
                        Approve
                      </Button>
                      <Button 
                        mode="outlined" 
                        onPress={handleCancel}
                        style={[styles.statusBtn, { borderColor: '#d32f2f' }]}
                        textColor="#d32f2f"
                        icon="close-circle"
                        labelStyle={styles.btnLabel}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {order.status === 'Approved' && (
                    <Button 
                      mode="contained" 
                      onPress={() => updateStatus('Shipped')}
                      style={[styles.statusBtn, { backgroundColor: '#012d1d' }]}
                      icon="local-shipping"
                      labelStyle={styles.btnLabel}
                    >
                      Mark Shipped
                    </Button>
                  )}
                  {order.status === 'Shipped' && (
                    <Button 
                      mode="contained" 
                      onPress={() => updateStatus('Delivered')}
                      style={[styles.statusBtn, { backgroundColor: '#795900' }]}
                      icon="home"
                      labelStyle={styles.btnLabel}
                    >
                      Mark Delivered
                    </Button>
                  )}
                  {['Cancelled', 'Delivered'].includes(order.status) && (
                    <Text style={styles.finalStatusText}>
                      This order is {order.status.toLowerCase()}. No further actions required.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Information</Text>
            <View style={styles.glassCard}>
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="business" size={20} color="#012d1d" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Company</Text>
                  <Text style={styles.infoValue}>{order.clientId?.companyName || 'Ceylon Spices Client'}</Text>
                </View>
              </View>
              <Divider style={styles.innerDivider} />
              <View style={styles.infoRow}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="person" size={20} color="#012d1d" />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Contact Person</Text>
                  <Text style={styles.infoValue}>{order.clientId?.userId?.name || 'Unknown'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <View style={styles.glassCard}>
              {order.products?.map((item, index) => (
                <View key={index}>
                  {renderProductItem({ item })}
                  {index < order.products.length - 1 && <Divider style={styles.innerDivider} />}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryCardCustom}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{order.products?.length || 0}</Text>
              </View>
              <Divider style={styles.innerDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>USD {order.totalAmount?.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Related Documents Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Documents</Text>
              {isAdminOrStaff && (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('UploadDocument', { orderId: order._id })}
                  style={styles.addDocBtn}
                >
                  <MaterialIcons name="add-circle" size={18} color="#012d1d" />
                  <Text style={styles.addDocText}>Upload</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.glassCard}>
              {docsLoading ? (
                <LoadingSpinner />
              ) : documents.length > 0 ? (
                documents.map((doc, index) => (
                  <TouchableOpacity 
                    key={doc._id}
                    onPress={() => navigation.navigate('DocumentDetail', { documentId: doc._id, title: doc.title })}
                    style={styles.docItem}
                  >
                    <View style={styles.docIconCircle}>
                      <MaterialIcons name="description" size={20} color="#795900" />
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      <Text style={styles.docMeta}>{doc.type} • {new Date(doc.uploadDate).toLocaleDateString()}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyDocs}>
                  <MaterialIcons name="info-outline" size={24} color="#AEAEB2" />
                  <Text style={styles.emptyDocsText}>No documents available.</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            {isClient && order.status === 'Pending' && (
              <Button 
                mode="outlined" 
                style={[styles.payButton, { backgroundColor: 'transparent', borderColor: '#012d1d', marginBottom: 12 }]}
                onPress={() => navigation.navigate('PlaceOrder', { editOrder: order })}
                icon="edit"
                textColor="#012d1d"
                labelStyle={styles.btnLabelLarge}
              >
                Edit Order Items
              </Button>
            )}

            {isClient && order.status === 'Approved' && order.paymentStatus !== 'Paid' && (
              <Button 
                mode="contained" 
                style={styles.payButton}
                onPress={() => navigation.navigate('PayOrder', { orderId: order._id, amount: order.totalAmount })}
                icon="credit-card"
                labelStyle={styles.btnLabelLarge}
              >
                Pay Now
              </Button>
            )}

            {isClient && (order.status === 'Pending' || (order.status === 'Approved' && order.paymentStatus !== 'Paid')) && (
              <TouchableOpacity 
                style={styles.cancelLink}
                onPress={handleCancel}
              >
                <MaterialIcons name="close" size={20} color="#d32f2f" />
                <Text style={styles.cancelText}>Cancel Order</Text>
              </TouchableOpacity>
            )}

            {isClient && (order.status === 'Cancelled' || order.status === 'Rejected') && (
              <TouchableOpacity 
                style={[styles.cancelLink, { marginTop: 10 }]}
                onPress={handleHide}
              >
                <MaterialIcons name="visibility-off" size={20} color="#6E6E80" />
                <Text style={[styles.cancelText, { color: '#6E6E80' }]}>Remove from my view</Text>
              </TouchableOpacity>
            )}

            {user?.role === 'admin' && (
              <Button 
                mode="contained" 
                onPress={handlePermanentDelete}
                style={[styles.payButton, { backgroundColor: '#d32f2f', marginTop: 20 }]}
                icon="delete-forever"
                labelStyle={styles.btnLabelLarge}
              >
                Permanently Delete Order
              </Button>
            )}
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
  headerCard: {
    backgroundColor: '#012d1d',
    padding: 24,
    paddingBottom: 48,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderIdLabel: {
    color: 'rgba(255, 223, 160, 0.8)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  orderIdValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  orderDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingTop: 50, // Added more padding to prevent header clipping
    marginTop: -32,
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
  glassCard: {
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
    paddingVertical: 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
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
    fontWeight: '800',
    color: '#1b4332',
    marginTop: 2,
  },
  innerDivider: {
    marginVertical: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1b4332',
  },
  productGrade: {
    fontSize: 12,
    color: '#795900',
    fontWeight: '700',
    marginTop: 2,
  },
  productPriceInfo: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
  },
  itemPrice: {
    fontSize: 12,
    color: '#795900',
    fontWeight: '800',
    marginTop: 2,
  },
  summaryCardCustom: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.1)',
    shadowColor: '#795900',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6E6E80',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#012d1d',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1b4332',
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#795900',
  },
  statusButtonsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusBtn: {
    flex: 1,
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
  },
  btnLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  finalStatusText: {
    fontSize: 14,
    color: '#6E6E80',
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  actionButtons: {
    marginTop: 12,
  },
  payButton: {
    borderRadius: 18,
    backgroundColor: '#012d1d',
    height: 56,
    justifyContent: 'center',
    elevation: 4,
  },
  btnLabelLarge: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cancelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d32f2f',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addDocText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#012d1d',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  docIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(121, 89, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1b4332',
  },
  docMeta: {
    fontSize: 12,
    color: '#6E6E80',
    marginTop: 2,
  },
  emptyDocs: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyDocsText: {
    fontSize: 14,
    color: '#AEAEB2',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default OrderDetailScreen;
