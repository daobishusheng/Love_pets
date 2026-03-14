import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CoinDisplay({ coins }) {
  return (
    <View style={styles.container}>
      <Text style={styles.coinIcon}>💰</Text>
      <Text style={styles.coinText}>{coins}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  coinIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});