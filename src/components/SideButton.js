import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

export default function SideButton({ imageSource, label, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Image source={imageSource} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    marginVertical: 6,
    padding: 6,
    backgroundColor: '#FFF0F5',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFB6C1',
    width: 60,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 15,
    color: '#FF69B4',
    marginTop: 2,
  },
});