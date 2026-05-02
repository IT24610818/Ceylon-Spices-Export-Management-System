import React from 'react';
import { View, ScrollView, StyleSheet, Image, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Button, Card, Divider, Text, useTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { Avatar } from 'react-native-paper';

const MoreScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const theme = useTheme();

  const isClient = user?.role === 'client';

  const managementItems = [
    {
      icon: 'local-shipping',
      label: !isClient ? 'Shipment Management' : 'Track Shipments',
      sublabel: 'Real-time delivery status',
      screen: 'ShipmentList',
      color: '#2196f3',
    },
    {
      icon: 'payment',
      label: !isClient ? 'Payment Management' : 'My Payments',
      sublabel: 'Transaction history & receipts',
      screen: 'PaymentList',
      color: '#4caf50',
    },
    {
      icon: 'description',
      label: !isClient ? 'Document Management' : 'My Documents',
      sublabel: 'Export & trade documentation',
      screen: 'DocumentList',
      color: '#ff9800',
    },
  ];

  const appItems = [
    ...(isClient ? [{
      icon: 'account-circle',
      label: 'My Profile',
      sublabel: 'Manage account & security',
      screen: 'Profile',
      color: '#012d1d',
      isCommunity: true,
    }] : []),
    {
      icon: 'info',
      label: 'About Us',
      sublabel: 'Our heritage & core values',
      screen: 'AboutUs',
      color: '#607d8b',
    },
    {
      icon: 'help-outline',
      label: 'Help & Support',
      sublabel: '24/7 technical assistance',
      screen: 'Support',
      color: '#f44336',
    },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'SIGN OUT',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'SIGN OUT', onPress: async () => await logout(), style: 'destructive' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Premium Header */}
      <View style={styles.headerTopCustom}>
        <Text style={styles.headerTitle}>MORE OPTIONS</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {user?.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={styles.profileAvatar}
              />
            ) : (
              <Avatar.Text 
                size={100} 
                label={user?.name?.substring(0, 2).toUpperCase() || 'CS'} 
                style={styles.avatarText}
              />
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'Ceylon Spice User'}</Text>
          <View style={styles.badgeContainer}>
            <MaterialIcons name="verified" size={14} color="#795900" />
            <Text style={styles.badgeText}>
              {user?.role?.toLowerCase() === 'client' ? 'PREMIUM BUYER' : user?.role?.toUpperCase() || 'BUYER'}
            </Text>
          </View>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Business Management</Text>
          <View style={styles.menuContainer}>
            {managementItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.premiumMenuCard}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(1, 45, 29, 0.05)' }]}>
                  <MaterialIcons
                    name={item.icon}
                    size={24}
                    color="#012d1d"
                  />
                </View>
                <View style={styles.menuTextInfo}>
                  <Text style={styles.menuMainLabel}>{item.label}</Text>
                  <Text style={styles.menuSubLabel}>{item.sublabel}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#795900" />
              </TouchableOpacity>
            ))}
          </View>

          {user?.role?.toLowerCase() === 'admin' && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Executive Insights</Text>
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.premiumMenuCard}
                  onPress={() => navigation.navigate('Analytics')}
                >
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(1, 45, 29, 0.05)' }]}>
                    <MaterialIcons name="analytics" size={24} color="#012d1d" />
                  </View>
                  <View style={styles.menuTextInfo}>
                    <Text style={styles.menuMainLabel}>Analytics & Reports</Text>
                    <Text style={styles.menuSubLabel}>System-wide performance audit</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#795900" />
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Application Info</Text>
          <View style={styles.menuContainer}>
            {appItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.premiumMenuCard}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(121, 89, 0, 0.05)' }]}>
                  {item.isCommunity ? (
                    <MaterialCommunityIcons name={item.icon} size={22} color="#795900" />
                  ) : (
                    <MaterialIcons name={item.icon} size={22} color="#795900" />
                  )}
                </View>
                <View style={styles.menuTextInfo}>
                  <Text style={styles.menuMainLabel}>{item.label}</Text>
                  <Text style={styles.menuSubLabel}>{item.sublabel}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#795900" />
              </TouchableOpacity>
            ))}
          </View>

          <Divider style={styles.divider} />

          <TouchableOpacity
            style={styles.signoutBtn}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color="#ffffff" />
            <Text style={styles.signoutText}>SIGN OUT</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Ceylon Spices Export v1.0.0</Text>
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
  headerTopCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 100,
    paddingTop: 40,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.05)',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
    letterSpacing: 2,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  profileSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    backgroundColor: '#012d1d',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#012d1d',
    letterSpacing: -0.5,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(121, 89, 0, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
    gap: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#795900',
    letterSpacing: 1,
  },
  userEmail: {
    fontSize: 13,
    color: '#6E6E80',
    marginTop: 10,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6E6E80',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  menuContainer: {
    gap: 12,
  },
  premiumMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextInfo: {
    flex: 1,
  },
  menuMainLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#012d1d',
  },
  menuSubLabel: {
    fontSize: 11,
    color: '#6E6E80',
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 28,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
  },
  signoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#012d1d',
    height: 56,
    borderRadius: 18,
    gap: 10,
    shadowColor: '#012d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signoutText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  versionText: {
    textAlign: 'center',
    color: '#AEAEB2',
    fontSize: 11,
    marginTop: 32,
    marginBottom: 40,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default MoreScreen;
