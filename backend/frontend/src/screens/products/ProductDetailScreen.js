import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Card, Text, Button, Divider, useTheme } from 'react-native-paper';
import axiosInstance from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { productId } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const isEditable = user?.role === 'admin' || user?.role === 'staff';
  const isAdmin = user?.role === 'admin';

  const BASE_URL = axiosInstance.defaults.baseURL.replace('/api/v1', '');

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/products/${productId}`);
      setProduct(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await axiosInstance.delete(`/products/${productId}`);
              Alert.alert('Success', 'Product deleted successfully');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete product');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProductDetails} />;
  if (!product) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header with Back Button */}
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#012d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name.toUpperCase()}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Space for bottom tab bar and order button
      >
        <View style={styles.imageWrapper}>
          {product.image ? (
            <Image 
              source={{ uri: product.image?.startsWith('http') ? product.image : `${BASE_URL}/${product.image}` }} 
              style={styles.productImage} 
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="eco" size={80} color="#012d1d" />
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}
        </View>

        <View style={styles.contentCard}>
          <View style={styles.detailHeader}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.scientificName}>{product.scientificName || 'Premium Ceylon Spices'}</Text>
            </View>
            <View style={styles.statusBadgeWrapper}>
              <StatusBadge status={product.availabilityStatus ? 'In Stock' : 'Out of Stock'} />
            </View>
          </View>

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Price per {product.unit || 'kg'}</Text>
              <Text style={styles.priceValue}>USD {product.pricePerUnit?.toLocaleString()}</Text>
            </View>
            {isEditable && (
              <View style={styles.stockBox}>
                <Text style={styles.stockValue}>{product.quantity}</Text>
                <Text style={styles.stockLabel}>Stock Available</Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialIcons name="category" size={20} color="#012d1d" />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Category</Text>
                  <Text style={styles.infoValue}>{product.category?.name || 'Spices'}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="grade" size={20} color="#012d1d" />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>Grade</Text>
                  <Text style={styles.infoValue}>{product.grade || 'Export Quality'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>
                {product.description || 'This is a premium quality Ceylon spice product, known for its unique aroma and flavor profile. Sourced directly from our certified growers.'}
              </Text>
            </View>
          </View>

          <View style={styles.actionSection}>
            {user?.role === 'client' ? (
              <Button 
                mode="contained" 
                style={styles.mainButton}
                onPress={() => navigation.navigate('MyOrders', { screen: 'PlaceOrder', params: { initialProduct: product } })}
                icon="cart-plus"
                labelStyle={styles.buttonLabel}
              >
                Order Now
              </Button>
            ) : (
              <>
                <Button 
                  mode="contained" 
                  style={styles.mainButton}
                  onPress={() => navigation.navigate('EditProduct', { productId: product._id })}
                  icon="pencil"
                  labelStyle={styles.buttonLabel}
                >
                  Edit Product
                </Button>
                
                {isAdmin && (
                  <TouchableOpacity 
                    style={styles.deleteLink}
                    onPress={handleDelete}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#d32f2f" />
                    <Text style={styles.deleteText}>Delete Product</Text>
                  </TouchableOpacity>
                )}
              </>
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
  headerTop: {
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
  imageWrapper: {
    width: width,
    height: 320,
    backgroundColor: '#ffffff',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
  },
  placeholderText: {
    marginTop: 12,
    color: '#6E6E80',
    fontSize: 14,
    fontWeight: '600',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  productName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1b4332',
    letterSpacing: -0.5,
  },
  scientificName: {
    fontSize: 14,
    color: '#795900', // Amber
    fontWeight: '700',
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusBadgeWrapper: {
    alignItems: 'flex-end',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
  },
  priceLabel: {
    fontSize: 11,
    color: '#6E6E80',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#012d1d',
    marginTop: 4,
  },
  stockBox: {
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 2,
  },
  stockValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1b4332',
  },
  stockLabel: {
    fontSize: 9,
    color: '#795900',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    marginBottom: 32,
  },
  infoSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  infoTextWrapper: {
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 10,
    color: '#6E6E80',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1b4332',
    marginTop: 2,
  },
  descriptionBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.03)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  descriptionLabel: {
    fontSize: 12,
    color: '#795900',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#414844',
  },
  actionSection: {
    marginTop: 8,
  },
  mainButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#012d1d',
    justifyContent: 'center',
    elevation: 4,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d32f2f',
  },
});

export default ProductDetailScreen;
