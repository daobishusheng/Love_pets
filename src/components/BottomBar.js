import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function BottomBar({
  hunger,
  happiness,
  cleanliness,
  energy,
  onShop,
  onBackpack,
  onReborn,
  onSign,
  onMusicToggle,   // 新增
  isMusicPlaying,  // 新增
}) {
  return (
    <View style={styles.container}>
      {/* 进度条横向排列 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>饱</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${hunger}%`, backgroundColor: '#4CAF50' }]} />
          </View>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>乐</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${happiness}%`, backgroundColor: '#FF9800' }]} />
          </View>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>洁</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${cleanliness}%`, backgroundColor: '#2196F3' }]} />
          </View>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>精</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${energy}%`, backgroundColor: '#9C27B0' }]} />
          </View>
        </View>
      </View>

      {/* 底部按钮行 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.bottomButton} onPress={onShop}>
          <Text style={styles.buttonIcon}>🏪</Text>
          <Text style={styles.buttonText}>商店</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={onBackpack}>
          <Text style={styles.buttonIcon}>🎒</Text>
          <Text style={styles.buttonText}>背包</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={onReborn}>
          <Text style={styles.buttonIcon}>🔄</Text>
          <Text style={styles.buttonText}>重生</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomButton, styles.signButton]} onPress={onSign}>
          <Text style={styles.buttonIcon}>📅</Text>
          <Text style={styles.buttonText}>签到</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.bottomButton, isMusicPlaying ? styles.musicOnButton : styles.musicOffButton]} 
          onPress={onMusicToggle}>
          <Text style={styles.buttonIcon}>{isMusicPlaying ? '🔊' : '🔇'}</Text>
          <Text style={styles.buttonText}>音乐</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  progressBar: {
    height: 6,
    width: '100%',
    backgroundColor: '#FFE4E1',
    borderRadius: 3,
  },
  progress: {
    height: '100%',
    borderRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomButton: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFF0F5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFB6C1',
    minWidth: 60,
  },
  signButton: {
    borderColor: '#FFD700',
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 12,
    color: '#FF69B4',
    marginTop: 2,
  },
  musicOnButton: {
  borderColor: '#4CAF50',
},
  musicOffButton: {
    borderColor: '#999',
  },
});