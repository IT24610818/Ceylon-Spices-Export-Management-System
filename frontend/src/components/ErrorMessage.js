import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

const ErrorMessage = ({ message, onRetry = null }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.error}>{message}</Text>
      {onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          style={styles.retryButton}
          labelStyle={styles.retryLabel}
        >
          Retry
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    marginBottom: 12,
    borderRadius: 4,
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    marginTop: 8,
  },
  retryLabel: {
    fontSize: 12,
  },
});

export default ErrorMessage;
