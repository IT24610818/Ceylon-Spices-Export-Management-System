import React from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { Text, Card, List, Divider } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView, TouchableOpacity } from 'react-native';

const AboutUsScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>ABOUT US</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandSection}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.brandTitle}>CEYLON SPICES</Text>
          <View style={styles.separator} />
          <Text style={styles.brandSubtitle}>EXCELLENCE IN EVERY GRAIN</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.premiumCard}>
            <Text style={styles.paragraph}>
              Ceylon Spices is a leading global supplier of authentic Sri Lankan spices, essential oils, and oleoresins. We bridge the gap between traditional farmers and international markets, ensuring the highest quality standards and sustainable practices.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.premiumCard}>
            <Text style={styles.paragraph}>
              To empower local farmers while delivering the pure essence of Ceylon spices to every corner of the world, maintaining transparency, quality, and excellence in every shipment.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Connectivity</Text>
          <View style={styles.premiumCard}>
            <ContactItem icon="email" label="Official Email" value="support@ceylonspices.com" />
            <Divider style={styles.innerDivider} />
            <ContactItem icon="phone" label="Hotline" value="+94 11 234 5678" />
            <Divider style={styles.innerDivider} />
            <ContactItem icon="public" label="Official Website" value="www.ceylonspices.com" />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const ContactItem = ({ icon, label, value }) => (
  <View style={styles.contactItem}>
    <View style={styles.iconCircle}>
      <MaterialIcons name={icon} size={20} color="#012d1d" />
    </View>
    <View style={styles.contactInfo}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </View>
  </View>
);

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
    height: 100,
    paddingTop: 40,
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
  scrollContent: {
    padding: 20,
  },
  brandSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    marginBottom: 28,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#012d1d',
    marginTop: 20,
    letterSpacing: 3,
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#795900',
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 10,
  },
  separator: {
    width: 40,
    height: 3,
    backgroundColor: '#795900',
    marginTop: 12,
    borderRadius: 2,
  },
  section: {
    marginBottom: 28,
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
  premiumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#012d1d',
    fontWeight: '600',
    textAlign: 'justify',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 10,
    color: '#6E6E80',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  contactValue: {
    fontSize: 15,
    color: '#012d1d',
    fontWeight: '800',
    marginTop: 2,
  },
  innerDivider: {
    marginVertical: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
  },
});

export default AboutUsScreen;
