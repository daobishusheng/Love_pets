import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStageName } from '../utils/evolution';

export default function StatusBars({
  hunger,
  happiness,
  cleanliness,
  energy,
  exp,
  stage,
}) {
  return (
    <View style={styles.stats}>
      <Text>饱食度: {hunger}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${hunger}%`, backgroundColor: '#4CAF50' }]} />
      </View>

      <Text>快乐度: {happiness}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${happiness}%`, backgroundColor: '#FF9800' }]} />
      </View>

      <Text>清洁度: {cleanliness}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${cleanliness}%`, backgroundColor: '#2196F3' }]} />
      </View>

      <Text>精力: {energy}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${energy}%`, backgroundColor: '#9C27B0' }]} />
      </View>

      <Text>经验值: {exp}</Text>
      <Text style={styles.stageText}>{getStageName(stage)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FFE4E1',
    borderRadius: 4,
    marginVertical: 3,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  stageText: {
    fontSize: 16,
    marginTop: 5,
    color: '#FF69B4',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});