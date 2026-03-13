import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BREEDS } from '../config/breeds';
import { RARITY } from '../config/rarity';

export default function Header({ petBreed, rarity, onBreedChange }) {
  return (
    <View style={styles.header}>
      <View style={styles.breedSelector}>
        {Object.keys(BREEDS).map(breed => (
          <TouchableOpacity
            key={breed}
            style={[styles.breedButton, petBreed === breed && styles.activeBreed]}
            onPress={() => onBreedChange(breed)}>
            <Text style={styles.breedText}>{BREEDS[breed].emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.rarityBadge, { backgroundColor: RARITY[rarity].color }]}>
        <Text style={styles.rarityText}>{RARITY[rarity].name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  breedSelector: {
    flexDirection: 'row',
  },
  breedButton: {
    padding: 10,
    marginRight: 5,
    backgroundColor: '#FFE4E1',
    borderRadius: 25,
    width: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFB6C1',
  },
  activeBreed: {
    backgroundColor: '#FFB6C1',
    borderColor: '#FF69B4',
  },
  breedText: {
    fontSize: 20,
  },
  rarityBadge: {
    padding: 5,
    borderRadius: 15,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  rarityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});