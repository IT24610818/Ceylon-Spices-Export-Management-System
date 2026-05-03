import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Searchbar, Card, Text, FAB, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ClientListScreen = ({ navigation }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useFocusEffect(
    useCallback(() => {
      fetchClients();
    }, [])
  );

  const fetchClients = async () => {
    try {
      setError('');
      const response = await axiosInstance.get('/clients');
      const data = response.data.data || [];
      setClients(data);
      filterClients(data, searchQuery);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  const filterClients = (data, query) => {
    if (!query.trim()) {
      setFilteredClients(data);
    } else {
      const q = query.toLowerCase();
      setFilteredClients(
        data.filter(
          (c) =>
            (c.companyName || '').toLowerCase().includes(q) ||
            (c.country || '').toLowerCase().includes(q) ||
            (c.userId?.name || '').toLowerCase().includes(q)
        )
      );
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterClients(clients, text);
  };

  const renderClient = ({ item }) => {
    const isClient = !item.isInternal;
    const role = item.role || item.userId?.role || 'N/A';
    
    // Icon based on role
    const getRoleIcon = () => {
      if (role === 'admin') return 'admin-panel-settings';
      if (role === 'staff') return 'badge';
      return 'business';
    };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ClientDetail', { clientId: item._id, isInternal: !isClient })}
      >
        <Card style={[
          styles.premiumCard, 
          !item.isActive && styles.deactivatedCard
        ]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.row}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: !isClient ? 'rgba(1, 45, 29, 0.05)' : 'rgba(121, 89, 0, 0.05)' }]}>
                <MaterialIcons 
                  name={getRoleIcon()} 
                  size={24} 
                  color={!isClient ? '#012d1d' : '#795900'} 
                />
              </View>
              
              <View style={styles.infoContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {isClient ? item.companyName : item.userId?.name || item.name}
                  </Text>
                  <View style={[
                    styles.roleBadge, 
                    role === 'admin' ? styles.adminBadge : role === 'staff' ? styles.staffBadge : styles.clientBadge
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      role === 'admin' ? styles.adminBadgeText : role === 'staff' ? styles.staffBadgeText : styles.clientBadgeText
                    ]}>
                      {role.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.metaRow}>
                  <MaterialIcons name="alternate-email" size={14} color="#6E6E80" />
                  <Text style={styles.metaText}>{isClient ? item.userId?.email || item.email : item.userId?.email || 'System User'}</Text>
                </View>

                {item.isActive === false && (
                  <View style={styles.deactivatedRow}>
                    <MaterialIcons name="block" size={12} color="#d32f2f" />
                    <Text style={styles.deactivatedText}>ACCOUNT DEACTIVATED</Text>
                  </View>
                )}
              </View>
              
              <MaterialIcons name="chevron-right" size={20} color="rgba(1, 45, 29, 0.2)" />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner message={isAdmin ? "Loading users..." : "Loading clients..."} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>USER MANAGEMENT</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.searchSection}>
          <Searchbar
            placeholder={isAdmin ? "Search name, company..." : "Search clients..."}
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#012d1d"
            inputStyle={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>

        {error ? <ErrorMessage message={error} onRetry={fetchClients} /> : null}

        <FlatList
          data={filteredClients}
          renderItem={renderClient}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#012d1d']} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people"
              message={searchQuery ? 'No users found' : 'User list is empty'}
            />
          }
        />

        <FAB
          icon="plus"
          onPress={() => navigation.navigate('AddClient')}
          style={styles.fab}
          color="#ffffff"
          label={isAdmin ? "ADD NEW USER" : "ADD NEW CLIENT"}
        />
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
    height: 110,
    paddingTop: 45,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#012d1d',
    letterSpacing: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    elevation: 0,
    height: 50,
  },
  searchInput: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
  },
  premiumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.03)',
  },
  deactivatedCard: {
    opacity: 0.7,
    backgroundColor: '#fafafa',
  },
  cardContent: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#012d1d',
    flex: 1,
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  adminBadge: { backgroundColor: '#fff1f0', borderColor: '#ffa39e' },
  adminBadgeText: { color: '#cf1322' },
  staffBadge: { backgroundColor: '#e6f7ff', borderColor: '#91d5ff' },
  staffBadgeText: { color: '#096dd9' },
  clientBadge: { backgroundColor: '#f6ffed', borderColor: '#b7eb8f' },
  clientBadgeText: { color: '#389e0d' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6E6E80',
    fontWeight: '600',
  },
  deactivatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  deactivatedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#d32f2f',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 110,
    backgroundColor: '#012d1d',
    borderRadius: 16,
  },
});

export default ClientListScreen;
