import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const EmptyState = ({ icon = 'inbox', message, actionLabel = null, onAction = null }) => {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={64} color="#ccc" />
      <Text style={styles.message}>{message}</Text>
      {onAction && actionLabel && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.actionButton}
          labelStyle={styles.actionLabel}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 32,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#6200ee',
    marginTop: 24,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EmptyState;
