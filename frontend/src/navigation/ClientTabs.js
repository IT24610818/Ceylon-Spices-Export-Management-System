import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';

import OrderListScreen from '../screens/orders/OrderListScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import PlaceOrderScreen from '../screens/orders/PlaceOrderScreen';

import ShipmentListScreen from '../screens/shipments/ShipmentListScreen';
import ShipmentDetailScreen from '../screens/shipments/ShipmentDetailScreen';

import PaymentListScreen from '../screens/payments/PaymentListScreen';
import PaymentDetailScreen from '../screens/payments/PaymentDetailScreen';
import PayScreen from '../screens/payments/PayScreen';

import DocumentListScreen from '../screens/documents/DocumentListScreen';
import DocumentDetailScreen from '../screens/documents/DocumentDetailScreen';

import MoreScreen from '../screens/MoreScreen';
import ClientDashboardScreen from '../screens/dashboard/ClientDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import SupportScreen from '../screens/SupportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const defaultScreenOptions = {
  headerStyle: { 
    backgroundColor: '#ffffff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.1)',
  },
  headerTintColor: '#012d1d',
  headerTitleStyle: { 
    fontWeight: '800', 
    textTransform: 'uppercase', 
    letterSpacing: 2,
    fontSize: 16,
  },
  headerTitleAlign: 'center',
};

const DashboardStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="DashboardMain"
      component={ClientDashboardScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const BrowseStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="BrowseProducts"
      component={ProductListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const OrderStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="OrderListMain"
      component={OrderListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="OrderDetail"
      component={OrderDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PlaceOrder"
      component={PlaceOrderScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PayOrder"
      component={PayScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DocumentDetail"
      component={DocumentDetailScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="MoreMain"
      component={MoreScreen}
      options={{ headerShown: false }}
    />
    {/* Moved from bottom tabs to More Stack */}
    <Stack.Screen
      name="ShipmentList"
      component={ShipmentListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ShipmentDetail"
      component={ShipmentDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PaymentList"
      component={PaymentListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PaymentDetail"
      component={PaymentDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DocumentList"
      component={DocumentListScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DocumentDetail"
      component={DocumentDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AboutUs"
      component={AboutUsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Support"
      component={SupportScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ClientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (focused) {
            if (route.name === 'Dashboard') iconName = 'dashboard';
            else if (route.name === 'Browse') iconName = 'shopping-bag';
            else if (route.name === 'MyOrders') iconName = 'receipt-long';
            else if (route.name === 'More') iconName = 'more-horiz';
          } else {
            if (route.name === 'Dashboard') iconName = 'dashboard';
            else if (route.name === 'Browse') iconName = 'shopping-bag';
            else if (route.name === 'MyOrders') iconName = 'receipt-long';
            else if (route.name === 'More') iconName = 'more-horiz';
          }

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
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
        name="Browse"
        component={BrowseStack}
        options={{ title: 'Browse' }}
      />
      <Tab.Screen
        name="MyOrders"
        component={OrderStack}
        options={{ 
          title: 'Orders',
          unmountOnBlur: true,
        }}
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
    backgroundColor: '#fffbeb', // Light yellow background for active tab
  },
});

export default ClientTabs;
