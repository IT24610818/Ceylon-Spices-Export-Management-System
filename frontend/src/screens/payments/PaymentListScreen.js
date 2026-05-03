import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Card, Text } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const PaymentListScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const isEditable = user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setError('');
      const response = await axiosInstance.get('/payments');
      setPayments(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  const renderPayment = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('PaymentDetail', {
          paymentId: item._id,
          invoiceNumber: item.invoiceNumber,
        })
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text style={styles.invoiceNumber}>
                Invoice #{item.invoiceNumber}
              </Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.amount}>
                USD {item.amount?.toLocaleString()}
              </Text>
            </View>
            {item.orderId && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Order</Text>
                <Text style={styles.value}>
                  #{item.orderId._id?.slice(-6).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner message="Loading payments..." />;
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
          {isEditable ? 'PAYMENT MANAGEMENT' : 'MY PAYMENTS'}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.container}>
        {error ? <ErrorMessage message={error} onRetry={fetchPayments} /> : null}

        {payments.length === 0 ? (
          <EmptyState icon="payment" message="No payments found" />
        ) : (
          <FlatList
            data={payments}
            renderItem={renderPayment}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#012d1d']} />
            }
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
  invoiceNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1b4332',
    letterSpacing: -0.5,
  },
  date: {
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
  amount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#795900',
  },
  value: {
    fontSize: 13,
    fontWeight: '800',
    color: '#012d1d',
  },
});

export default PaymentListScreen;
