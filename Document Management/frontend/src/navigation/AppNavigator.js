import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdminTabs from './AdminTabs';
import StaffTabs from './StaffTabs';
import ClientTabs from './ClientTabs';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          // Auth Stack
          <Stack.Group screenOptions={{ animationEnabled: true }}>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                animationEnabled: true,
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                animationEnabled: true,
              }}
            />
          </Stack.Group>
        ) : (
          // App Stack - Route by Role
          <>
            {user?.role === 'admin' && (
              <Stack.Screen
                name="AdminApp"
                component={AdminTabs}
                options={{ animationEnabled: false }}
              />
            )}
            {user?.role === 'staff' && (
              <Stack.Screen
                name="StaffApp"
                component={StaffTabs}
                options={{ animationEnabled: false }}
              />
            )}
            {user?.role === 'client' && (
              <Stack.Screen
                name="ClientApp"
                component={ClientTabs}
                options={{ animationEnabled: false }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
