import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ordersRes, paymentsRes, shipmentsRes] = await Promise.all([
        axiosInstance.get('/orders'),
        axiosInstance.get('/payments'),
        axiosInstance.get('/shipments'),
      ]);

      const orders = ordersRes.data.data || [];
      const payments = paymentsRes.data.data || [];
      const shipments = shipmentsRes.data.data || [];

      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
      const totalRevenue = payments
        .filter((p) => p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);
      const activeShipments = shipments.filter(
        (s) => s.status !== 'Delivered'
      ).length;

      setStats({
        totalOrders,
        pendingOrders,
        totalRevenue,
        activeShipments,
      });

      setRecentOrders(orders.slice(0, 4));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  if (loading) {
    return <LoadingSpinner message="Loading executive dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Dynamic Header */}
      <View style={styles.headerTopCustom}>
        <View>
          <Text style={styles.headerLabel}>{isAdmin ? 'ADMINISTRATOR' : 'OFFICIAL STAFF'}</Text>
          <Text style={styles.headerTitle}>EXECUTIVE DASHBOARD</Text>
        </View>
        <View style={styles.headerIconCircle}>
          <MaterialIcons 
            name={isAdmin ? "admin-panel-settings" : "badge"} 
            size={24} 
            color="#012d1d" 
          />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {error ? <ErrorMessage message={error} onRetry={fetchDashboardData} /> : null}

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Management</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.premiumActionCard}
              onPress={() => navigation.navigate('Products', { screen: 'AddProduct' })}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(1, 45, 29, 0.05)' }]}>
                <MaterialIcons name="add-box" size={24} color="#012d1d" />
              </View>
              <Text style={styles.actionMainLabel}>New Product</Text>
              <Text style={styles.actionSubLabel}>Update Catalog</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.premiumActionCard}
              onPress={() => navigation.navigate('Clients', { screen: 'AddClient' })}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(121, 89, 0, 0.05)' }]}>
                <MaterialIcons name="person-add" size={24} color="#795900" />
              </View>
              <Text style={styles.actionMainLabel}>New Client</Text>
              <Text style={styles.actionSubLabel}>Onboard User</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Executive Stats Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.premiumStatCard, { backgroundColor: '#012d1d' }]}>
              <MaterialIcons name="payments" size={22} color="#ffffff" style={styles.statIcon} />
              <Text style={styles.statValueLight}>
                USD {(stats?.totalRevenue / 1000).toFixed(1)}k
              </Text>
              <Text style={styles.statLabelLight}>Total Revenue</Text>
            </View>

            <View style={styles.premiumStatCard}>
              <MaterialCommunityIcons name="package-variant-closed" size={22} color="#795900" style={styles.statIcon} />
              <Text style={styles.statValueDark}>{stats?.totalOrders}</Text>
              <Text style={styles.statLabelDark}>Total Orders</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.premiumStatCard}>
              <MaterialIcons name="pending-actions" size={22} color="#795900" style={styles.statIcon} />
              <Text style={styles.statValueDark}>{stats?.pendingOrders}</Text>
              <Text style={styles.statLabelDark}>Pending Orders</Text>
            </View>

            <View style={styles.premiumStatCard}>
              <MaterialIcons name="local-shipping" size={22} color="#795900" style={styles.statIcon} />
              <Text style={styles.statValueDark}>{stats?.activeShipments}</Text>
              <Text style={styles.statLabelDark}>Active Shipments</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders List */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyText}>No recent activity found</Text>
            </View>
          ) : (
            recentOrders.map((item) => (
              <TouchableOpacity 
                key={item._id}
                style={styles.activityCard}
                onPress={() => navigation.navigate('Orders', { screen: 'OrderDetail', params: { orderId: item._id } })}
              >
                <View style={styles.activityIconWrapper}>
                  <MaterialIcons name="assignment" size={20} color="#012d1d" />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.activitySubtitle}>{item.clientId?.companyName || 'Export Client'}</Text>
                </View>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityAmount}>${item.totalAmount?.toLocaleString()}</Text>
                  <StatusBadge status={item.status} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

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
  headerTopCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 100,
    paddingTop: 40,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.05)',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#795900',
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#012d1d',
    letterSpacing: 1,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E6E80',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#012d1d',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#795900',
    textTransform: 'uppercase',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  premiumActionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionMainLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
  },
  actionSubLabel: {
    fontSize: 10,
    color: '#6E6E80',
    marginTop: 2,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  premiumStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 24,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 12,
  },
  statValueDark: {
    fontSize: 22,
    fontWeight: '900',
    color: '#012d1d',
    letterSpacing: -1,
  },
  statValueLight: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  statLabelDark: {
    fontSize: 11,
    color: '#6E6E80',
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabelLight: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  activityIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
  },
  activitySubtitle: {
    fontSize: 11,
    color: '#6E6E80',
    marginTop: 2,
    fontWeight: '600',
  },
  activityMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#012d1d',
  },
  emptyStateContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6E6E80',
    fontWeight: '600',
  },
});

export default DashboardScreen;
