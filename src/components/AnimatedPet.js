import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function AnimatedPet({ isSleeping }) {
  console.log('AnimatedPet 被调用了, isSleeping:', isSleeping);
  
  if (!isSleeping) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animations/cat/data.json')}
        style={styles.animation}
        autoPlay
        loop
        speed={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 350,
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 350,
    height: 350,
  },
});