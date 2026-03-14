import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function ActionButtons({
  onFeed,
  onPlay,
  onClean,
  onSleep,
  onWake,
  onReborn,
  onShopPress,
  onBackpackPress,
  isSleeping,
}) {
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonScroll}>
        <TouchableOpacity style={[styles.button, styles.feed]} onPress={onFeed}>
          <Text style={styles.buttonIcon}>🍖</Text>
          <Text style={styles.buttonText}>喂食</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.play]} onPress={onPlay}>
          <Text style={styles.buttonIcon}>🎾</Text>
          <Text style={styles.buttonText}>玩耍</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clean]} onPress={onClean}>
          <Text style={styles.buttonIcon}>🛁</Text>
          <Text style={styles.buttonText}>清洁</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.sleep]} onPress={onSleep}>
          <Text style={styles.buttonIcon}>😴</Text>
          <Text style={styles.buttonText}>睡觉</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.wake]} onPress={onWake}>
          <Text style={styles.buttonIcon}>🌞</Text>
          <Text style={styles.buttonText}>唤醒</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.shop]} onPress={onShopPress}>
          <Text style={styles.buttonIcon}>🏪</Text>
          <Text style={styles.buttonText}>商店</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.backpack]} onPress={onBackpackPress}>
          <Text style={styles.buttonIcon}>🎒</Text>
          <Text style={styles.buttonText}>背包</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.rebornButton} onPress={onReborn}>
        <Text style={styles.rebornText}>🔄 重生转世</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  buttonScroll: {
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  feed: { backgroundColor: '#4CAF50' },
  play: { backgroundColor: '#FF9800' },
  clean: { backgroundColor: '#2196F3' },
  sleep: { backgroundColor: '#9C27B0' },
  wake: { backgroundColor: '#FFA500' },
  shop: { backgroundColor: '#FFB6C1' },
  backpack: { backgroundColor: '#8B4513' },
  rebornButton: {
    padding: 15,
    backgroundColor: '#FF69B4',
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  rebornText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});