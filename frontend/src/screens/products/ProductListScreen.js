import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Searchbar, Card, Text, FAB, Chip, useTheme } from 'react-native-paper';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState({ _id: 'All', name: 'All' });
  const [categories, setCategories] = useState([{ _id: 'All', name: 'All' }]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const { user } = useAuth();
  const isEditable = user?.role === 'admin' || user?.role === 'staff';

  const BASE_URL = axiosInstance.defaults.baseURL.replace('/api/v1', '');

  useFocusEffect(
    React.useCallback(() => {
      fetchInitialData();
    }, [])
  );

  const fetchInitialData = async () => {
    try {
      setError('');
      const [productsRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/products'),
        axiosInstance.get('/products/categories/all'),
      ]);

      const productsData = productsRes.data.data || [];
      const categoriesData = [{ _id: 'All', name: 'All' }, ...(categoriesRes.data.data || [])];
      
      setProducts(productsData);
      setCategories(categoriesData);
      setFilteredProducts(productsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(query.toLowerCase()) ||
                          p.scientificName?.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory._id === 'All' || p.category?._id === selectedCategory._id;
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const filtered = products.filter((p) => {
      const matchesCategory = category._id === 'All' || p.category?._id === category._id;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id, name: item.name })}
    >
      <Card style={styles.modernCard}>
        <Card.Content style={styles.cardInner}>
          <View style={styles.productRow}>
            {item.image ? (
              <Image 
                source={{ uri: item.image?.startsWith('http') ? item.image : `${BASE_URL}/${item.image}` }} 
                style={styles.thumbnail} 
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <MaterialIcons name="eco" size={32} color="#012d1d" />
              </View>
            )}
            
            <View style={styles.productInfoMain}>
              <View style={styles.productHeader}>
                <View style={styles.productInfoText}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.categoryName}>
                    {item.category?.name || 'Ceylon Spice'}
                  </Text>
                </View>
                <StatusBadge status={item.availabilityStatus ? 'In Stock' : 'Out of Stock'} />
              </View>
              
              <View style={styles.productBody}>
                <Text style={styles.grade}>{item.grade || 'Premium Grade'}</Text>
              </View>

              <View style={styles.productFooter}>
                <View>
                  <Text style={styles.priceLabel}>Price / {item.unit || 'kg'}</Text>
                  <Text style={styles.price}>USD {item.pricePerUnit?.toLocaleString()}</Text>
                </View>
                {isEditable && (
                  <View style={styles.quantityContainer}>
                    <Text style={styles.quantity}>{item.quantity} {item.unit || 'kg'}</Text>
                    <Text style={styles.quantityLabel}>Stock</Text>
                  </View>
                )}
              </View>
            </View>
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
        <Text style={styles.headerTitle}>BROWSE PRODUCTS</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Searchbar
            placeholder="Search products..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#012d1d"
            inputStyle={styles.searchInput}
          />
          
          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <Chip
                selected={selectedCategory._id === item._id}
                onPress={() => handleCategorySelect(item)}
                style={[
                  styles.categoryChip,
                  selectedCategory._id === item._id && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  selectedCategory._id === item._id && styles.selectedChipText
                ]}
                showSelectedOverlay
              >
                {item.name}
              </Chip>
            )}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

      {error ? <ErrorMessage message={error} onRetry={fetchInitialData} /> : null}

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#012d1d']} />
        }
        ListEmptyComponent={<EmptyState icon="eco" message="No spices found in this category" />}
      />

      {isEditable && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddProduct')}
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
    height: 110,
    paddingTop: 45,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#012d1d',
    letterSpacing: 4,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  headerSection: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    elevation: 0,
    height: 50,
  },
  searchInput: {
    fontSize: 15,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 0,
  },
  selectedChip: {
    backgroundColor: '#012d1d',
  },
  chipText: {
    fontSize: 13,
    color: '#6E6E80',
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: '700',
  },
  productList: {
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
    overflow: 'hidden',
  },
  cardInner: {
    padding: 0,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  thumbnailPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: 'rgba(193, 236, 212, 0.3)', // primary-fixed light
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfoMain: {
    flex: 1,
    marginLeft: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productInfoText: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A24',
    letterSpacing: -0.5,
  },
  categoryName: {
    fontSize: 12,
    color: '#795900', // secondary amber
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  productBody: {
    marginTop: 4,
  },
  grade: {
    fontSize: 13,
    color: '#6E6E80',
    fontWeight: '600',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  priceLabel: {
    fontSize: 11,
    color: '#6E6E80',
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A24',
  },
  quantityContainer: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A24',
  },
  quantityLabel: {
    fontSize: 10,
    color: '#6E6E80',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 110,
    backgroundColor: '#012d1d',
    borderRadius: 16,
  },
});

export default ProductListScreen;
