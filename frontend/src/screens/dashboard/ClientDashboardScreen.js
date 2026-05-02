import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const { width } = Dimensions.get('window');

const PROMO_BANNERS = [
  {
    id: '1',
    badge: '20% OFF VOLUME',
    title: 'Premium Ceylon Cinnamon',
    subtitle: 'Grade Alba - Next Shipment',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS5AEERWH3Pdf7rNw1TNCIhEJeHdi5q9pE4idnamBFY7Vnuw_p8x_ZWyi7I3xGFSOdE5goIjm1-zf6SOKRmw3cNJuUgQkkwCfYjh1Jfi5bQlHgWKnl-BN5lCqPocfxODkv5OwF_dMoI30RZJIU9bmsZkeyhFHWYZJontNuZI89kX1cT8xe9BN-BsGui7G3hnE0icfiuwB7m8wD5W2buh0XlQhQWC1PsIRb3JTR344rGDO-CZiJNB7K65NOWB_u190tfDAK09dmawk',
    badgeBg: 'rgba(121, 89, 0, 0.2)', // secondary/20
    badgeColor: '#ffdfa0', // secondary-fixed
  },
  {
    id: '2',
    badge: 'NEW ARRIVAL',
    title: 'Pure Peppermint Oil',
    subtitle: 'Distilled to Perfection',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi3SgUejpMu_zXYfcP0d75k56PsVFhMIP2Gw_GUsz4foD4wDl3KJP8wNSexs3ndPdoSK7AYpI3Cf7haA0eYXGSciC_UKXcVcfN57kj3_WXEwhpogD1naZ54myge61yhVknRK32RCRjE0R_-cfLhqHWhh0T1DuxWqhc8UNI280F8JHASpX7bB93P88mAHaoV-xTL7HcQFVsSR69EuJ1Xmt0BetNNBT0dXks15sdFif79S-MV0_GsZ8Hs_djf4MiVshIxt48zxzOAcM',
    badgeBg: 'rgba(1, 45, 29, 0.2)', // primary/20
    badgeColor: '#c1ecd4', // primary-fixed
  },
];

const ClientDashboardScreen = ({ navigation }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const prodRes = await axiosInstance.get('/products'); 
      setRecommendedProducts(prodRes.data.data || prodRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing your dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CEYLON SPICES</Text>
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 16 }}
      >
        {error ? <ErrorMessage message={error} onRetry={fetchDashboardData} /> : null}

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeName}>Hi, {user?.name?.split(' ')[0] || 'Alexander'}</Text>
          <Text style={styles.welcomeSubtitle}>Welcome back to your export dashboard.</Text>
        </View>
          <View style={styles.badgeContainer}>
            <MaterialIcons name="verified" size={16} color="#795900" />
            <Text style={styles.badgeText}>PREMIUM BUYER</Text>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.searchSection}
          onPress={() => navigation.navigate('Browse')}
        >
          <View style={styles.searchFakeInput}>
            <MaterialIcons name="search" size={22} color="#717973" style={{ marginRight: 12 }} />
            <Text style={styles.searchPlaceholderText}>Search premium export products...</Text>
          </View>
        </TouchableOpacity>

        {/* Promo Carousel */}
        <View style={styles.promoSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoScrollContent}
            snapToInterval={width * 0.85 + 16}
            decelerationRate="fast"
          >
            {PROMO_BANNERS.map(promo => (
              <TouchableOpacity key={promo.id} activeOpacity={0.9}>
                <ImageBackground 
                  source={{ uri: promo.image }} 
                  style={styles.promoCard}
                  imageStyle={{ borderRadius: 12 }}
                >
                  <View style={styles.promoOverlay}>
                    <View style={styles.promoContent}>
                      <View style={[styles.promoBadge, { backgroundColor: promo.badgeBg }]}>
                        <Text style={[styles.promoBadgeText, { color: promo.badgeColor }]}>{promo.badge}</Text>
                      </View>
                      <Text style={styles.promoTitle}>{promo.title}</Text>
                      <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <View style={styles.gridContainer}>
            {recommendedProducts.slice(0, 4).map((product) => (
              <TouchableOpacity 
                key={product._id} 
                style={styles.productCard}
                onPress={() => navigation.navigate('Browse', { screen: 'ProductDetail', params: { productId: product._id, name: product.name }})}
              >
                <View style={styles.productImageContainer}>
                  {product.image ? (
                    <Image source={{ uri: product.image.startsWith('http') ? product.image : `${axiosInstance.defaults.baseURL.replace('/api/v1', '')}${product.image}` }} style={styles.productImage} />
                  ) : (
                    <View style={[styles.productImage, { backgroundColor: '#e4e2e1', justifyContent: 'center', alignItems: 'center' }]}>
                      <MaterialIcons name="image" size={40} color="#a7a6a3" />
                    </View>
                  )}
                  <View style={styles.productIconBadge}>
                    <MaterialIcons name="workspace-premium" size={16} color="#795900" />
                  </View>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>${product.pricePerUnit} / {product.unit}</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#c1c8c2" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcf9f8', // surface-bright
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 110,
    paddingTop: 45, // Moved down to clear the camera notch
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
    fontSize: 22,
    fontWeight: '800',
    color: '#012d1d', // primary green
    letterSpacing: 4,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  welcomeTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  welcomeName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1b4332', // primary-container
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#414844', // on-surface-variant
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 198, 65, 0.2)', // secondary-container/20
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 198, 65, 0.5)',
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#795900', // secondary
    letterSpacing: 1.2,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  searchFakeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    // Glassmorphism shadow
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  searchPlaceholderText: {
    color: '#c1c8c2', // outline-variant
    fontSize: 16,
  },
  promoSection: {
    marginBottom: 32,
  },
  promoScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  promoCard: {
    width: width * 0.85,
    height: 200,
    borderRadius: 12,
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 67, 50, 0.6)', // Gradient simulation (primary-container)
    borderRadius: 12,
    padding: 24,
    justifyContent: 'center',
  },
  promoContent: {
    justifyContent: 'center',
  },
  promoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  promoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  promoTitle: {
    fontSize: 24, // headline-md equivalent roughly
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24, // headline-md
    fontWeight: '700',
    color: '#1b4332', // primary-container
    marginBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    width: (width - 48 - 16) / 2, // 2 items per row with 24px horizontal padding and 16px gap
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
    marginBottom: 16,
  },
  productImageContainer: {
    height: 120,
    position: 'relative',
    backgroundColor: '#e4e2e1', // surface-variant
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productIconBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b1c1c', // on-surface
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#795900', // secondary
  },
});

export default ClientDashboardScreen;
