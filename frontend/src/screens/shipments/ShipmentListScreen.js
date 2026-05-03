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
import { Card, Text, FAB, Chip } from 'react-native-paper';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ShipmentListScreen = ({ navigation }) => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const isEditable = user?.role === 'staff' || user?.role === 'admin';

  useFocusEffect(
    React.useCallback(() => {
      fetchShipments();
    }, [])
  );

  const fetchShipments = async () => {
    try {
      setError('');
      const response = await axiosInstance.get('/shipments');
      const data = response.data.data || [];
      setShipments(data);
      filterShipments(data, 'All');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShipments();
    setRefreshing(false);
  };

  const filterShipments = (data, method) => {
    if (method === 'All') {
      setFilteredShipments(data);
    } else {
      setFilteredShipments(data.filter((s) => s.shippingMethod === method));
    }
  };

  const handleFilter = (method) => {
    setSelectedMethod(method);
    filterShipments(shipments, method);
  };

  const renderShipment = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ShipmentDetail', {
          shipmentId: item._id,
          trackingNumber: item.trackingNumber,
        })
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text style={styles.trackingNumber}>
                {item.trackingNumber}
              </Text>
              <Text style={styles.subtitle}>
                Order: {item.orderId?._id?.slice(-6).toUpperCase()}
              </Text>
            </View>
            <StatusBadge status={item.shippingMethod} />
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Status:</Text>
              <StatusBadge status={item.status} />
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Est. Delivery:</Text>
              <Text style={styles.value}>
                {new Date(item.estimatedDelivery).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner message="Loading shipments..." />;
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
          {isEditable ? 'SHIPMENT MANAGEMENT' : 'TRACK SHIPMENTS'}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <FlatList
            data={['All', 'Air', 'Sea']}
            renderItem={({ item }) => (
              <Chip
                selected={selectedMethod === item}
                onPress={() => handleFilter(item)}
                style={[
                  styles.chip,
                  selectedMethod === item && styles.chipActive,
                ]}
                textStyle={{ 
                  color: selectedMethod === item ? '#ffffff' : '#8E8E93',
                  fontWeight: selectedMethod === item ? '900' : '700',
                  fontSize: 12
                }}
                showSelectedOverlay
                selectedColor="#ffffff"
              >
                {item}
              </Chip>
            )}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipList}
          />
        </View>

        {error ? <ErrorMessage message={error} onRetry={fetchShipments} /> : null}

        {filteredShipments.length === 0 ? (
          <EmptyState icon="truck-delivery" message="No shipments found" />
        ) : (
          <FlatList
            data={filteredShipments}
            renderItem={renderShipment}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#012d1d']} />
            }
          />
        )}

        {isEditable && (
          <FAB
            icon="plus"
            onPress={() => navigation.navigate('AddShipment')}
            style={styles.fab}
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
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  chipList: {
    paddingHorizontal: 16,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
    elevation: 2,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  chipActive: {
    backgroundColor: '#012d1d',
    borderColor: '#012d1d',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93', 
  },
  chipLabelActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trackingNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1b4332',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#795900',
    fontWeight: '700',
    marginTop: 4,
  },
  details: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(251, 191, 36, 0.08)',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#6E6E80',
    fontWeight: '700',
  },
  value: {
    fontSize: 13,
    fontWeight: '800',
    color: '#012d1d',
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

export default ShipmentListScreen;
