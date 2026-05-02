import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Text, Card, ProgressBar, Divider, Button } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [ordersRes, paymentsRes, productsRes, clientsRes] = await Promise.all([
        axiosInstance.get('/orders'),
        axiosInstance.get('/payments'),
        axiosInstance.get('/products'),
        axiosInstance.get('/clients'),
      ]);

      const orders = ordersRes.data.data || [];
      const payments = paymentsRes.data.data || [];
      const products = productsRes.data.data || [];
      const clients = clientsRes.data.data || [];

      // Calculate Data
      const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
      const pendingRevenue = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
      
      const orderStats = {
        total: orders.length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        pending: orders.filter(o => o.status === 'Pending').length,
      };

      const topProducts = products.slice(0, 3).map(p => ({
        name: p.name,
        stock: p.stockQuantity,
        price: p.pricePerUnit,
        percentage: Math.min(1, p.stockQuantity / 500)
      }));

      setData({
        totalRevenue,
        pendingRevenue,
        orderStats,
        topProducts,
        clientCount: clients.length,
        productCount: products.length,
      });
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      setLoading(true);
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #012d1d; }
              .header { text-align: center; border-bottom: 2px solid #795900; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
              .header p { margin: 5px 0; color: #795900; font-weight: bold; font-size: 12px; text-transform: uppercase; }
              .section { margin-bottom: 30px; }
              .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; }
              .stats-grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
              .stat-box { flex: 1; background: #fcf9f8; padding: 20px; border-radius: 10px; border: 1px solid #eee; }
              .stat-label { font-size: 10px; color: #6E6E80; text-transform: uppercase; margin-bottom: 5px; }
              .stat-value { font-size: 20px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { text-align: left; background: #012d1d; color: white; padding: 10px; font-size: 12px; }
              td { padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; }
              .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #AEAEB2; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <p>Ceylon Spices Export Management System</p>
              <h1>EXECUTIVE SYSTEM AUDIT</h1>
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>

            <div class="section">
              <div class="section-title">Financial Summary</div>
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="stat-label">Total Realized Revenue</div>
                  <div class="stat-value">$${data.totalRevenue.toLocaleString()}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Pending Revenue</div>
                  <div class="stat-value">$${data.pendingRevenue.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Order Performance</div>
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="stat-label">Total Orders</div>
                  <div class="stat-value">${data.orderStats.total}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Delivered</div>
                  <div class="stat-value">${data.orderStats.delivered}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">In Transit</div>
                  <div class="stat-value">${data.orderStats.shipped}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Key Inventory Assets</div>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Current Stock</th>
                    <th>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.topProducts.map(p => `
                    <tr>
                      <td>${p.name}</td>
                      <td>${p.stock} Units</td>
                      <td>$${p.price.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">System Metrics</div>
              <p>Total Active Clients: <strong>${data.clientCount}</strong></p>
              <p>Total Registered Products: <strong>${data.productCount}</strong></p>
            </div>

            <div class="footer">
              Confidential Executive Report &copy; ${new Date().getFullYear()} Ceylon Spices Export (PEMS)
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      Alert.alert('Export Failed', 'An error occurred while generating the report.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    console.log('Starting PDF Generation...');
    generatePDF();
  };

  if (loading) return <LoadingSpinner message="Generating analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAnalyticsData} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#012d1d" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>EXECUTIVE</Text>
          <Text style={styles.headerTitle}>ANALYTICS & REPORTS</Text>
        </View>
        <TouchableOpacity style={styles.reportIcon} onPress={handleGenerateReport}>
          <MaterialIcons name="picture-as-pdf" size={24} color="#012d1d" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Revenue Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Distribution</Text>
          <Card style={styles.revenueCard}>
            <View style={styles.revenueRow}>
              <View>
                <Text style={styles.revLabel}>Total Realized</Text>
                <Text style={styles.revValue}>${data.totalRevenue.toLocaleString()}</Text>
              </View>
              <View style={styles.revDivider} />
              <View>
                <Text style={styles.revLabel}>Pending Approval</Text>
                <Text style={[styles.revValue, { color: '#795900' }]}>${data.pendingRevenue.toLocaleString()}</Text>
              </View>
            </View>
            <ProgressBar 
              progress={data.totalRevenue / (data.totalRevenue + data.pendingRevenue || 1)} 
              color="#012d1d" 
              style={styles.progressBar} 
            />
            <Text style={styles.progressText}>
              {Math.round((data.totalRevenue / (data.totalRevenue + data.pendingRevenue || 1)) * 100)}% of total revenue finalized
            </Text>
          </Card>
        </View>

        {/* Order Status Visualization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{data.orderStats.delivered}</Text>
              <Text style={styles.statLabel}>Completed</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#4caf50' }]} />
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{data.orderStats.shipped}</Text>
              <Text style={styles.statLabel}>In Transit</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#2196f3' }]} />
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{data.orderStats.pending}</Text>
              <Text style={styles.statLabel}>Processing</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#ff9800' }]} />
            </View>
          </View>
        </View>

        {/* Inventory Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory Health</Text>
          <Card style={styles.premiumCard}>
            {data.topProducts.map((product, index) => (
              <View key={index} style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productStock}>{product.stock} Units Remaining</Text>
                </View>
                <View style={styles.productVisual}>
                  <ProgressBar progress={product.percentage} color={product.percentage < 0.2 ? '#d32f2f' : '#012d1d'} style={styles.smallProgress} />
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <Button 
            mode="contained" 
            onPress={handleGenerateReport}
            style={styles.mainReportBtn}
            icon="file-download"
            labelStyle={styles.btnLabel}
          >
            GENERATE SYSTEM REPORT
          </Button>
          <Text style={styles.helperText}>Includes full audit of clients, products, and payments.</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 90,
    paddingTop: 30,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(251, 191, 36, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fcf9f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#795900',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#012d1d',
    letterSpacing: 1,
    marginTop: 2,
  },
  reportIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#012d1d',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    marginLeft: 4,
  },
  revenueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#1b4332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  revLabel: {
    fontSize: 11,
    color: '#6E6E80',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  revValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#012d1d',
  },
  revDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f1f3f5',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fcf9f8',
  },
  progressText: {
    fontSize: 10,
    color: '#6E6E80',
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 3,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#012d1d',
  },
  statLabel: {
    fontSize: 10,
    color: '#6E6E80',
    fontWeight: '700',
    marginTop: 4,
  },
  statIndicator: {
    width: 12,
    height: 3,
    borderRadius: 2,
    marginTop: 8,
  },
  premiumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    elevation: 3,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#012d1d',
  },
  productStock: {
    fontSize: 11,
    color: '#6E6E80',
    fontWeight: '600',
    marginTop: 2,
  },
  productVisual: {
    width: 100,
  },
  smallProgress: {
    height: 6,
    borderRadius: 3,
  },
  actionSection: {
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
  },
  mainReportBtn: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#012d1d',
  },
  btnLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 11,
    color: '#6E6E80',
    marginTop: 12,
    fontWeight: '600',
  },
});

export default AnalyticsScreen;
