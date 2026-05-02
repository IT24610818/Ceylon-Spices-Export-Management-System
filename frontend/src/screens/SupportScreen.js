import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, List, Card, Button, Divider } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView, TouchableOpacity } from 'react-native';

const SupportScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>HELP & SUPPORT</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconCircleLarge}>
            <MaterialIcons name="headset-mic" size={40} color="#012d1d" />
          </View>
          <Text style={styles.heroTitle}>How can we assist you today?</Text>
          <Text style={styles.heroSubtitle}>Our dedicated team is ready to support your global trade needs.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.premiumCard}>
            <List.Accordion 
              title="How to track my order?" 
              titleStyle={styles.accordionTitle}
              style={styles.accordion}
              left={props => <MaterialIcons name="local-shipping" size={20} color="#795900" style={{ marginRight: 8 }} />}
            >
              <List.Item 
                title="Go to More -> Track Shipments and enter your tracking ID." 
                titleNumberOfLines={3}
                titleStyle={styles.accordionContent}
              />
            </List.Accordion>
            <Divider style={styles.innerDivider} />
            <List.Accordion 
              title="Payment Methods" 
              titleStyle={styles.accordionTitle}
              style={styles.accordion}
              left={props => <MaterialIcons name="payment" size={20} color="#795900" style={{ marginRight: 8 }} />}
            >
              <List.Item 
                title="We accept Bank Transfers, Credit Cards, and L/C for international trade." 
                titleNumberOfLines={3}
                titleStyle={styles.accordionContent}
              />
            </List.Accordion>
            <Divider style={styles.innerDivider} />
            <List.Accordion 
              title="Contact Support" 
              titleStyle={styles.accordionTitle}
              style={styles.accordion}
              left={props => <MaterialIcons name="contact-support" size={20} color="#795900" style={{ marginRight: 8 }} />}
            >
              <List.Item 
                title="Our support team is available 24/7 via this help center." 
                titleNumberOfLines={3}
                titleStyle={styles.accordionContent}
              />
            </List.Accordion>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direct Assistance</Text>
          <View style={styles.premiumCard}>
            <SupportButton 
              icon="chat" 
              title="Live Business Chat" 
              subtitle="Average response: 2 mins" 
              onPress={() => {}}
              primary
            />
            <Divider style={styles.innerDivider} />
            <SupportButton 
              icon="email" 
              title="Send an Official Email" 
              subtitle="support@ceylonspices.com" 
              onPress={() => {}}
            />
            <Divider style={styles.innerDivider} />
            <SupportButton 
              icon="phone" 
              title="Call Technical Support" 
              subtitle="+94 11 234 5678" 
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SupportButton = ({ icon, title, subtitle, onPress, primary = false }) => (
  <TouchableOpacity style={styles.supportBtn} onPress={onPress}>
    <View style={[styles.iconCircleSmall, primary && styles.iconCirclePrimary]}>
      <MaterialIcons name={icon} size={22} color={primary ? '#ffffff' : '#012d1d'} />
    </View>
    <View style={styles.supportText}>
      <Text style={styles.supportTitle}>{title}</Text>
      <Text style={styles.supportSubtitle}>{subtitle}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={20} color="#6E6E80" />
  </TouchableOpacity>
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
  heroSection: {
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
    paddingHorizontal: 20,
  },
  iconCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(1, 45, 29, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#012d1d',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#6E6E80',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
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
    padding: 12,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.05)',
  },
  accordion: {
    backgroundColor: '#ffffff',
    paddingVertical: 4,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
  },
  accordionContent: {
    fontSize: 13,
    color: '#6E6E80',
    lineHeight: 20,
    paddingLeft: 40,
    fontWeight: '600',
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconCircleSmall: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(121, 89, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconCirclePrimary: {
    backgroundColor: '#012d1d',
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
  },
  supportSubtitle: {
    fontSize: 12,
    color: '#6E6E80',
    marginTop: 2,
    fontWeight: '600',
  },
  innerDivider: {
    marginVertical: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
  },
});

export default SupportScreen;
