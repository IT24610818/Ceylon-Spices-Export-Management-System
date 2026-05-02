import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, Text, FAB, Chip, useTheme, Divider } from 'react-native-paper';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const { user } = useAuth();
  const isClient = user?.role === 'client';

  const statuses = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      setError('');
      const response = await axiosInstance.get('/orders');
      const data = response.data.data || [];
      setOrders(data);
      filterOrders(data, selectedStatus);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (allOrders, status) => {
    if (status === 'All') {
      setFilteredOrders(allOrders);
    } else {
      setFilteredOrders(allOrders.filter((o) => o.status === status));
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    filterOrders(orders, status);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <Card style={styles.modernCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt || item.orderDate || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.orderBody}>
            <View style={styles.clientInfo}>
              <MaterialIcons name="business" size={18} color="#012d1d" style={styles.icon} />
              <Text style={styles.clientName} numberOfLines={1}>
                {item.clientId?.companyName || 'Ceylon Spice Client'}
              </Text>
            </View>
            
            <View style={styles.itemSummary}>
              <MaterialIcons name="inventory" size={18} color="#6E6E80" style={styles.icon} />
              <Text style={styles.itemCount}>
                {item.products?.length || 0} Products
              </Text>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>USD {item.totalAmount?.toLocaleString()}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MY ORDERS</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.headerSection}>
          <FlatList
            data={statuses}
            renderItem={({ item }) => (
              <Chip
                selected={selectedStatus === item}
                onPress={() => handleStatusChange(item)}
                style={[
                  styles.statusChip,
                  selectedStatus === item && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  selectedStatus === item && styles.selectedChipText
                ]}
                selectedColor="#ffffff" 
                showSelectedOverlay
              >
                {item}
              </Chip>
            )}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusList}
          />
        </View>

      {error ? <ErrorMessage message={error} onRetry={fetchOrders} /> : null}

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.orderList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#012d1d']} />
        }
        ListEmptyComponent={<EmptyState icon="assignment" message="No orders found for this status" />}
      />

      {isClient && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('PlaceOrder')}
          label="New Order"
          color="#fff"
        />
      )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 100,
    paddingTop: 40,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
    letterSpacing: 2,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  headerSection: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  statusList: {
    paddingHorizontal: 16,
  },
  statusChip: {
    marginRight: 8,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
    height: 36,
  },
  selectedChip: {
    backgroundColor: '#012d1d',
    borderColor: '#012d1d',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: '900',
  },
  orderList: {
    padding: 16,
    paddingBottom: 100,
  },
  modernCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A24',
    letterSpacing: -0.5,
  },
  orderDate: {
    fontSize: 12,
    color: '#6E6E80',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F5',
    marginBottom: 12,
  },
  orderBody: {
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
    flex: 1,
  },
  itemCount: {
    fontSize: 13,
    color: '#6E6E80',
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: -16,
    marginBottom: -16,
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6E6E80',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#795900', // amber
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 90,
    backgroundColor: '#012d1d',
    borderRadius: 16,
  },
});

export default OrderListScreen;
