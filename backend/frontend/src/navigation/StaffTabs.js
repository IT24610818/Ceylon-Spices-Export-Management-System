import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import AddProductScreen from '../screens/products/AddProductScreen';
import EditProductScreen from '../screens/products/EditProductScreen';

import OrderListScreen from '../screens/orders/OrderListScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';

import ClientListScreen from '../screens/clients/ClientListScreen';
import ClientDetailScreen from '../screens/clients/ClientDetailScreen';
import AddClientScreen from '../screens/clients/AddClientScreen';

import ShipmentListScreen from '../screens/shipments/ShipmentListScreen';
import ShipmentDetailScreen from '../screens/shipments/ShipmentDetailScreen';
import AddShipmentScreen from '../screens/shipments/AddShipmentScreen';

import PaymentListScreen from '../screens/payments/PaymentListScreen';
import PaymentDetailScreen from '../screens/payments/PaymentDetailScreen';

import DocumentListScreen from '../screens/documents/DocumentListScreen';
import DocumentDetailScreen from '../screens/documents/DocumentDetailScreen';
import UploadDocumentScreen from '../screens/documents/UploadDocumentScreen';
import EditDocumentScreen from '../screens/documents/EditDocumentScreen';

import MoreScreen from '../screens/MoreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import SupportScreen from '../screens/SupportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Dashboard Stack
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
  </Stack.Navigator>
);

// Product Stack
const ProductStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductListMain" component={ProductListScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="AddProduct" component={AddProductScreen} />
    <Stack.Screen name="EditProduct" component={EditProductScreen} />
  </Stack.Navigator>
);

// Order Stack
const OrderStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OrderListMain" component={OrderListScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
    <Stack.Screen name="UploadDocument" component={UploadDocumentScreen} />
    <Stack.Screen name="EditDocument" component={EditDocumentScreen} />
  </Stack.Navigator>
);

// Client Stack
const ClientStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ClientListMain" component={ClientListScreen} />
    <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
    <Stack.Screen name="AddClient" component={AddClientScreen} />
  </Stack.Navigator>
);

// More Stack
const MoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MoreMain" component={MoreScreen} />
    <Stack.Screen name="ShipmentList" component={ShipmentListScreen} />
    <Stack.Screen name="ShipmentDetail" component={ShipmentDetailScreen} />
    <Stack.Screen name="AddShipment" component={AddShipmentScreen} />
    <Stack.Screen name="PaymentList" component={PaymentListScreen} />
    <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} />
    <Stack.Screen name="DocumentList" component={DocumentListScreen} />
    <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
    <Stack.Screen name="UploadDocument" component={UploadDocumentScreen} />
    <Stack.Screen name="EditDocument" component={EditDocumentScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="AboutUs" component={AboutUsScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
  </Stack.Navigator>
);

const StaffTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Products') iconName = 'inventory';
          else if (route.name === 'Orders') iconName = 'assignment';
          else if (route.name === 'Clients') iconName = 'people';
          else if (route.name === 'More') iconName = 'more-horiz';

          return (
            <View style={[
              styles.iconContainer,
              focused && styles.activeIconContainer
            ]}>
              <MaterialIcons
                name={iconName}
                size={24}
                color={focused ? '#012d1d' : 'rgba(1, 45, 29, 0.5)'}
              />
            </View>
          );
        },
        tabBarActiveTintColor: '#012d1d',
        tabBarInactiveTintColor: 'rgba(1, 45, 29, 0.5)',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          height: 80,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 24,
          borderTopWidth: 0,
          paddingBottom: 15,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: -5,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Products"
        component={ProductStack}
        options={{ title: 'Products' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderStack}
        options={{ 
          title: 'Orders',
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientStack}
        options={{ title: 'Clients' }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 5,
  },
  activeIconContainer: {
    backgroundColor: '#fffbeb',
  },
});

export default StaffTabs;
