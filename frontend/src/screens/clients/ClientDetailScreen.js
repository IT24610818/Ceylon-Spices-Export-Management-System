import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Text, Divider } from 'react-native-paper';
import axiosInstance from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const ClientDetailScreen = ({ route, navigation }) => {
  const { clientId, isInternal } = route.params;
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const isStaff = currentUser?.role === 'staff';
  const canManage = isAdmin || isStaff;

  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClientDetail();
  }, []);

  const fetchClientDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const clientRes = await axiosInstance.get(`/clients/${clientId}`);
      const data = clientRes.data.data;
      setClient(data);

      if (data.role === 'client' || data.userId?.role === 'client') {
        const ordersRes = await axiosInstance.get(`/clients/${clientId}/orders`);
        setOrders(ordersRes.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const action = client.isActive ? 'Ban' : 'Unban';
    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: action, 
          onPress: async () => {
            try {
              const response = await axiosInstance.patch(`/clients/${clientId}/status`);
              setClient(prev => ({ ...prev, isActive: response.data.isActive }));
              Alert.alert('Success', response.data.message);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
            }
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete(`/clients/${clientId}`);
              Alert.alert('Success', 'Deleted successfully');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date Format' : date.toLocaleDateString();
  };

  if (loading) return <LoadingSpinner message="Loading user details..." />;
  if (!client) return <ErrorMessage message={error} onRetry={fetchClientDetail} />;

  const isClientRole = client.role === 'client' || client.userId?.role === 'client';
  const displayTitle = isClientRole ? client.companyName : client.userId?.name || client.name;
  const roleLabel = (client.role || client.userId?.role || 'N/A').toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#012d1d" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>MANAGEMENT</Text>
          <Text style={styles.headerTitle}>USER PROFILE</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <MaterialIcons 
                name={roleLabel === 'ADMIN' ? 'admin-panel-settings' : roleLabel === 'STAFF' ? 'badge' : 'business'} 
                size={40} 
                color="#012d1d" 
              />
            </View>
            {client.isActive === false && (
              <View style={styles.bannedBadge}>
                <MaterialIcons name="block" size={14} color="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{displayTitle}</Text>
          
          <View style={[
            styles.rolePill, 
            roleLabel === 'ADMIN' ? styles.adminPill : roleLabel === 'STAFF' ? styles.staffPill : styles.clientPill
          ]}>
            <Text style={[
              styles.rolePillText,
              roleLabel === 'ADMIN' ? styles.adminPillText : roleLabel === 'STAFF' ? styles.staffPillText : styles.clientPillText
            ]}>
              {roleLabel}
            </Text>
          </View>
          
          {client.isActive === false && (
            <Text style={styles.statusSub}>ACCOUNT CURRENTLY DEACTIVATED</Text>
          )}
        </View>

        {/* Info Grid */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            {isClientRole && (
              <View style={styles.infoItem}>
                <MaterialIcons name="qr-code" size={20} color="#012d1d" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Client Code</Text>
                  <Text style={styles.infoValue}>{client.clientCode}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <MaterialIcons name="email" size={20} color="#012d1d" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{client.email || client.userId?.email}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="phone" size={20} color="#012d1d" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{client.phone || 'Not Provided'}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
              <MaterialIcons name="public" size={20} color="#012d1d" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Country / Region</Text>
                <Text style={styles.infoValue}>{client.country || 'Internal Office'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Management Actions */}
        {canManage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administrative Actions</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => navigation.navigate('AddClient', { editClient: client })}
                disabled={isInternal && isStaff}
              >
                <MaterialIcons name="edit" size={20} color="#012d1d" />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, client.isActive !== false ? styles.banBtn : styles.unbanBtn]}
                onPress={handleToggleStatus}
                disabled={isInternal && isStaff}
              >
                <MaterialIcons name={client.isActive !== false ? "block" : "check-circle"} size={20} color="#fff" />
                <Text style={styles.actionBtnText}>{client.isActive !== false ? 'BAN USER' : 'UNBAN USER'}</Text>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={handleDelete}
                  disabled={isInternal && isStaff}
                >
                  <MaterialIcons name="delete-forever" size={20} color="#fff" />
                  <Text style={styles.actionBtnText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Orders for Clients */}
        {isClientRole && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {orders.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialIcons name="history" size={32} color="#b0b0b0" />
                <Text style={styles.emptyText}>No order history available</Text>
              </View>
            ) : (
              orders.map((order) => (
                <TouchableOpacity 
                  key={order._id} 
                  style={styles.orderCard} 
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order._id })}
                >
                  <View style={styles.orderLeft}>
                    <Text style={styles.orderId}>ORDER #{order._id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.orderDate || order.createdAt)}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={styles.orderAmount}>${order.totalAmount?.toLocaleString()}</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#012d1d" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
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
  profileCard: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#012d1d',
    marginBottom: 8,
  },
  rolePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  adminPill: { backgroundColor: '#fff1f0', borderColor: '#ffa39e' },
  adminPillText: { color: '#cf1322' },
  staffPill: { backgroundColor: '#e6f7ff', borderColor: '#91d5ff' },
  staffPillText: { color: '#096dd9' },
  clientPill: { backgroundColor: '#f6ffed', borderColor: '#b7eb8f' },
  clientPillText: { color: '#389e0d' },
  statusSub: {
    fontSize: 10,
    color: '#d32f2f',
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#012d1d',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6E6E80',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#012d1d',
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  editBtn: { backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: 'rgba(1, 45, 29, 0.12)' },
  editBtnText: { color: '#012d1d', fontWeight: '900', fontSize: 14 },
  banBtn: { backgroundColor: '#ff9800' },
  unbanBtn: { backgroundColor: '#4caf50' },
  deleteBtn: { backgroundColor: '#d32f2f' },
  actionBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(1, 45, 29, 0.05)',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 13,
    color: '#b0b0b0',
    fontWeight: '700',
    marginTop: 8,
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  orderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '900',
    color: '#012d1d',
  },
  orderDate: {
    fontSize: 12,
    color: '#6E6E80',
    marginTop: 2,
    fontWeight: '600',
  },
  orderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#012d1d',
  },
});

export default ClientDetailScreen;
