import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Searchbar, Card, Text, FAB, Chip, useTheme, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DocumentListScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const { user } = useAuth();
  const isEditable = user?.role === 'staff' || user?.role === 'admin';

  const docTypes = ['All', 'Invoice', 'Packing List', 'Certificate', 'Bill of Lading'];

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
    }, [])
  );

  const fetchDocuments = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError('');
      const response = await axiosInstance.get('/documents');
      const data = response.data || [];
      setDocuments(data);
      applyFilters(data, searchQuery, selectedType);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const applyFilters = (data, query, type) => {
    let filtered = [...data];

    if (type !== 'All') {
      filtered = filtered.filter((d) => d.type === type);
    }

    if (query.trim()) {
      filtered = filtered.filter((d) =>
        d.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(documents, text, selectedType);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    applyFilters(documents, searchQuery, type);
  };

  const renderDocument = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('DocumentDetail', {
          documentId: item._id,
          title: item.title,
        })
      }
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: getDocColor(item.type) + '15' }]}>
              <MaterialIcons 
                name={getDocIcon(item.type)} 
                size={24} 
                color={getDocColor(item.type)} 
              />
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <View style={styles.cardHeader}>
              <Text style={styles.docTitle} numberOfLines={1}>{item.title}</Text>
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.metaRow}>
                <MaterialIcons name="event" size={14} color="#999" />
                <Text style={styles.metaText}>{new Date(item.uploadDate).toLocaleDateString()}</Text>
              </View>
              
              {item.orderId && (
                <View style={styles.metaRow}>
                  <MaterialIcons name="receipt" size={14} color="#999" />
                  <Text style={styles.metaText}>Order #{item.orderId._id?.slice(-6).toUpperCase()}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.typeTag}>
              <Text style={[styles.typeText, { color: getDocColor(item.type) }]}>{item.type}</Text>
            </View>
          </View>
          
          <IconButton icon="chevron-right" size={20} iconColor="#CCC" />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const getDocIcon = (type) => {
    switch (type) {
      case 'Invoice': return 'receipt-long';
      case 'Packing List': return 'inventory-2';
      case 'Certificate': return 'verified';
      case 'Bill of Lading': return 'directions-boat';
      default: return 'description';
    }
  };

  const getDocColor = (type) => {
    switch (type) {
      case 'Invoice': return '#012d1d';
      case 'Packing List': return '#795900';
      case 'Certificate': return '#1b4332';
      case 'Bill of Lading': return '#a68a0d';
      default: return '#6E6E80';
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading your documents..." />;
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
          {isEditable ? 'DOCUMENT MANAGEMENT' : 'MY DOCUMENTS'}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.container}>
        <View style={styles.headerSearch}>
          <Searchbar
            placeholder="Search documents..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            placeholderTextColor="#AEAEB2"
            iconColor="#012d1d"
            selectionColor="#012d1d"
          />
        </View>

        <View style={styles.filterWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterContent}
          >
            {docTypes.map((type) => (
              <Chip
                key={type}
                selected={selectedType === type}
                onPress={() => handleTypeFilter(type)}
                style={[
                  styles.chip,
                  selectedType === type && styles.chipActive
                ]}
                textStyle={[
                  styles.chipText,
                  selectedType === type && styles.chipTextActive
                ]}
              >
                {type}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {error ? <ErrorMessage message={error} onRetry={fetchDocuments} /> : null}

        <FlatList
          data={filteredDocuments}
          renderItem={renderDocument}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#012d1d']} />
          }
          ListEmptyComponent={
            !loading && <EmptyState icon="folder-open" message={searchQuery ? "No documents match your search" : "No documents available yet"} />
          }
        />

        {isEditable && (
          <FAB
            icon="plus"
            label="Upload"
            onPress={() => navigation.navigate('UploadDocument')}
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
    height: 110,
    paddingTop: 45,
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
  headerSearch: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#fcf9f8',
    borderRadius: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
  },
  searchInput: {
    fontSize: 14,
    minHeight: 0,
    fontWeight: '600',
  },
  filterWrapper: {
    paddingVertical: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  chip: {
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 0,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#012d1d',
  },
  chipText: {
    fontSize: 12,
    color: '#6E6E80',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.03)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1b4332',
    flex: 1,
    marginRight: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#6E6E80',
    marginLeft: 4,
    fontWeight: '600',
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#fcf9f8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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

export default DocumentListScreen;
