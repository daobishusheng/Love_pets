import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image } from 'react-native';

const PetWithAnimation = ({ imageSource, isSleeping, happiness, hunger }) => {
  const breathValue = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;
  const shakeValue = useRef(new Animated.Value(0)).current;

  // 呼吸动画
  useEffect(() => {
    const breathAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathValue, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathAnimation.start();
    return () => breathAnimation.stop();
  }, []);

  // 开心时跳跃
  useEffect(() => {
    if (happiness > 80) {
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [happiness]);

  // 饿时摇晃
  useEffect(() => {
    if (hunger < 30) {
      Animated.sequence([
        Animated.timing(shakeValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeValue, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hunger]);

  const scale = breathValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const rotate = shakeValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

  // 睡觉时的 Z 动画
  const sleepZValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isSleeping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sleepZValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sleepZValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      sleepZValue.stopAnimation();
      sleepZValue.setValue(0);
    }
  }, [isSleeping]);

  const zOpacity = sleepZValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const zTranslateY = sleepZValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { scale },
          { translateY: bounceValue },
          { rotate },
        ],
      }}
    >
      <Image source={imageSource} style={{ width: 280, height: 280 }} resizeMode="contain" />
      
      {/* 睡觉 Z 动画 */}
      {isSleeping && (
        <Animated.Text
          style={{
            position: 'absolute',
            top: 20,
            right: 30,
            fontSize: 30,
            opacity: zOpacity,
            transform: [{ translateY: zTranslateY }],
          }}
        >
          💤
        </Animated.Text>
      )}
    </Animated.View>
  );
};

export default PetWithAnimation;