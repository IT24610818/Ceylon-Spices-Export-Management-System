import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  IconButton,
  Divider,
  useTheme,
} from 'react-native-paper';
import axiosInstance from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const PlaceOrderScreen = ({ route, navigation }) => {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const isEditing = route.params?.editOrder ? true : false;
  const editOrderId = route.params?.editOrder?._id;

  const BASE_URL = axiosInstance.defaults.baseURL.replace('/api/v1', '');

  useEffect(() => {
    fetchProducts();
    
    // If we are in edit mode
    if (isEditing) {
      const existingItems = route.params.editOrder.products.map(item => ({
        product: item.productId._id,
        name: item.productId.name,
        price: item.unitPrice || item.price,
        quantity: item.quantity,
        unit: item.productId.unit || 'kg',
        image: item.productId.image
      }));
      setSelectedItems(existingItems);
    }
    // If we came from Product Detail, auto-select that product
    else if (route.params?.initialProduct) {
      const prod = route.params.initialProduct;
      setSelectedItems([{
        product: prod._id,
        name: prod.name,
        price: prod.pricePerUnit,
        quantity: 1,
        unit: prod.unit || 'kg',
        image: prod.image
      }]);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/products');
      setProducts(response.data.data.filter(p => p.availabilityStatus));
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (product) => {
    const existing = selectedItems.find(item => item.product === product._id);
    if (existing) {
      updateQuantity(product._id, existing.quantity + 1);
    } else {
      setSelectedItems([...selectedItems, {
        product: product._id,
        name: product.name,
        price: product.pricePerUnit,
        quantity: 1,
        unit: product.unit || 'kg',
        image: product.image
      }]);
    }
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) {
      setSelectedItems(selectedItems.filter(item => item.product !== productId));
    } else {
      setSelectedItems(selectedItems.map(item => 
        item.product === productId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add at least one product to your order.');
      return;
    }

    try {
      setSubmitting(true);
      
      const orderData = {
        products: selectedItems.map(item => ({
          productId: item.product,
          quantity: item.quantity,
        }))
      };

      if (isEditing) {
        await axiosInstance.put(`/orders/${editOrderId}`, orderData);
        Alert.alert('Success', 'Order updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const response = await axiosInstance.post('/orders', orderData);
        Alert.alert('Success', 'Order placed successfully!', [
          { text: 'View Orders', onPress: () => navigation.navigate('OrderListMain') }
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to process order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

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
          {isEditing ? 'EDIT PENDING ORDER' : 'PLACE NEW ORDER'}
        </Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.container}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Select Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productPicker}>
              {products.map((prod) => (
                <TouchableOpacity 
                  key={prod._id} 
                  onPress={() => addToOrder(prod)}
                  style={styles.productThumbCard}
                >
                  <View style={styles.thumbImageWrapper}>
                    {prod.image ? (
                      <Image 
                        source={{ uri: prod.image.startsWith('http') ? prod.image : `${BASE_URL}/${prod.image}` }} 
                        style={styles.thumbImage} 
                      />
                    ) : (
                      <MaterialIcons name="eco" size={30} color="#012d1d" />
                    )}
                  </View>
                  <Text style={styles.thumbName} numberOfLines={1}>{prod.name}</Text>
                  <Text style={styles.thumbPrice}>USD {prod.pricePerUnit}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Your Cart</Text>
            {selectedItems.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialIcons name="shopping-basket" size={48} color="#AEAEB2" />
                <Text style={styles.emptyCartText}>No items added yet</Text>
              </View>
            ) : (
              selectedItems.map((item, index) => (
                <View key={index} style={styles.glassItemCard}>
                  <View style={styles.itemContent}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPriceDetail}>
                        USD {item.price} / {item.unit}
                      </Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <IconButton 
                        icon="minus-circle-outline" 
                        size={24} 
                        onPress={() => updateQuantity(item.product, item.quantity - 1)}
                        iconColor="#012d1d"
                      />
                      <Text style={styles.quantityValue}>{item.quantity}</Text>
                      <IconButton 
                        icon="plus-circle-outline" 
                        size={24} 
                        onPress={() => updateQuantity(item.product, item.quantity + 1)}
                        iconColor="#012d1d"
                      />
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>USD {calculateTotal().toLocaleString()}</Text>
          </View>
          <Button
            mode="contained"
            onPress={handlePlaceOrder}
            loading={submitting}
            disabled={submitting || selectedItems.length === 0}
            style={styles.placeOrderButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.btnLabel}
          >
            {isEditing ? 'Save Changes' : 'Confirm Order'}
          </Button>
        </View>
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
    marginLeft: 4,
  },
  productPicker: {
    marginBottom: 32,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  productThumbCard: {
    width: 120,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  thumbImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#fcf9f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1b4332',
    textAlign: 'center',
  },
  thumbPrice: {
    fontSize: 11,
    color: '#795900',
    fontWeight: '800',
    marginTop: 4,
  },
  glassItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.03)',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1b4332',
  },
  itemPriceDetail: {
    fontSize: 12,
    color: '#795900',
    fontWeight: '700',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcf9f8',
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#012d1d',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: 'rgba(251, 191, 36, 0.02)',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  emptyCartText: {
    marginTop: 12,
    color: '#AEAEB2',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingBottom: 100,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#012d1d',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6E6E80',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#012d1d',
  },
  placeOrderButton: {
    borderRadius: 18,
    backgroundColor: '#012d1d',
    height: 56,
    justifyContent: 'center',
  },
  buttonContent: {
    height: 56,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default PlaceOrderScreen;
