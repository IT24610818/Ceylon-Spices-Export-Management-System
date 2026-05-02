import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || '';

    const statusStyles = {
      pending: { backgroundColor: '#fff3cd', color: '#ff9800' },
      approved: { backgroundColor: '#e3f2fd', color: '#2196f3' },
      shipped: { backgroundColor: '#f3e5f5', color: '#9c27b0' },
      delivered: { backgroundColor: '#e8f5e9', color: '#4caf50' },
      cancelled: { backgroundColor: '#ffebee', color: '#d32f2f' },
      paid: { backgroundColor: '#e8f5e9', color: '#4caf50' },
      unpaid: { backgroundColor: '#fff3cd', color: '#ff9800' },
      air: { backgroundColor: '#e1f5fe', color: '#03a9f4' },
      sea: { backgroundColor: '#e0f2f1', color: '#009688' },
      active: { backgroundColor: '#e8f5e9', color: '#4caf50' },
      archived: { backgroundColor: '#f5f5f5', color: '#757575' },
      processing: { backgroundColor: '#fff3cd', color: '#ff9800' },
      'in transit': { backgroundColor: '#f3e5f5', color: '#9c27b0' },
      'customs clearance': { backgroundColor: '#fff3cd', color: '#ff9800' },
      dispatched: { backgroundColor: '#e3f2fd', color: '#2196f3' },
      rejected: { backgroundColor: '#ffebee', color: '#d32f2f' },
    };

    return statusStyles[statusLower] || { backgroundColor: '#f5f5f5', color: '#757575' };
  };

  const style = getStatusStyle(status);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: style.backgroundColor },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: style.color },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default StatusBadge;
