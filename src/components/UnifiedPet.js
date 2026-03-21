import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';

// 静态图片加载函数
const getImageSource = (breed, state) => {
  switch (breed) {
    case 'cat':
      switch (state) {
        case 'dirty': return require('../../images/cat/dirty.png');
        case 'happy': return require('../../images/cat/happy.png');
        case 'hungry': return require('../../images/cat/hungry.png');
        case 'sad': return require('../../images/cat/sad.png');
        case 'sick': return require('../../images/cat/sick.png');
        default: return require('../../images/cat/happy.png');
      }
    case 'dog':
      switch (state) {
        case 'dirty': return require('../../images/dog/dirty.png');
        case 'happy': return require('../../images/dog/happy.png');
        case 'hungry': return require('../../images/dog/hungry.png');
        case 'sad': return require('../../images/dog/sad.png');
        case 'sick': return require('../../images/dog/sick.png');
        default: return require('../../images/dog/happy.png');
      }
    case 'fox':
      switch (state) {
        case 'dirty': return require('../../images/fox/dirty.png');
        case 'happy': return require('../../images/fox/happy.png');
        case 'hungry': return require('../../images/fox/hungry.png');
        case 'sad': return require('../../images/fox/sad.png');
        case 'sick': return require('../../images/fox/sick.png');
        default: return require('../../images/fox/happy.png');
      }
    default:
      return require('../../images/cat/happy.png');
  }
};

// 动画文件映射
const ANIMATIONS = {
  sleep: require('../../assets/animations/cat/sleep.json'),
  happy: require('../../assets/animations/cat/happy.json'),
  hungry: require('../../assets/animations/cat/hungry.json'),
  dirty: require('../../assets/animations/cat/dirty.json'),
  sick: require('../../assets/animations/cat/sick.json'),
  sad: require('../../assets/animations/cat/sad.json'),
  feeding: require('../../assets/animations/cat/feeding.json'),
  caress: require('../../assets/animations/cat/caress.json'),
  wash: require('../../assets/animations/cat/wash.json'),
  idle: require('../../assets/animations/cat/idle.json'),
};

export default function UnifiedPet({
  petBreed,
  imageState,        // 从外部传入，用于触发一次性动画
  isSleeping,
  happiness,
  hunger,
  cleanliness,
  energy,
  onCaress,
}) {
  const [currentAnim, setCurrentAnim] = useState('idle');
  const [isLooping, setIsLooping] = useState(true);
  const [manualAnim, setManualAnim] = useState(null);  // 手动触发的动画
  const animTimer = useRef(null);
  const happyTimer = useRef(null);

  // 清除定时器
  const clearTimers = () => {
    if (animTimer.current) clearTimeout(animTimer.current);
    if (happyTimer.current) clearTimeout(happyTimer.current);
  };

  // 手动触发一次性动画（喂食/抚摸/清洁）
  const triggerAnimation = (animName, duration = 2000) => {
    if (isSleeping) return;
    clearTimers();
    setManualAnim(animName);
    setCurrentAnim(animName);
    setIsLooping(false);
    // 播放完成后恢复
    animTimer.current = setTimeout(() => {
      setManualAnim(null);
      updateAnimation();
    }, duration);
  };

  // 根据状态自动决定动画
  const updateAnimation = () => {
    if (manualAnim) return; // 手动动画优先
    
    if (isSleeping) {
      setCurrentAnim('sleep');
      setIsLooping(true);
      return;
    }
    
    // 状态触发的一次性动画
    if (hunger < 30) {
      setCurrentAnim('hungry');
      setIsLooping(false);
      // 2秒后恢复
      animTimer.current = setTimeout(() => updateAnimation(), 2000);
      return;
    }
    if (cleanliness < 30) {
      setCurrentAnim('dirty');
      setIsLooping(false);
      animTimer.current = setTimeout(() => updateAnimation(), 2000);
      return;
    }
    if (energy < 30) {
      setCurrentAnim('sick');
      setIsLooping(false);
      animTimer.current = setTimeout(() => updateAnimation(), 2000);
      return;
    }
    if (happiness < 30) {
      setCurrentAnim('sad');
      setIsLooping(false);
      animTimer.current = setTimeout(() => updateAnimation(), 2000);
      return;
    }
    
    // 默认待机（循环）
    setCurrentAnim('idle');
    setIsLooping(true);
  };

  // 监听外部传入的 imageState（喂食/玩耍/清洁按钮触发）
  useEffect(() => {
    if (!imageState) return;
    if (isSleeping) return;
    
    let animName = null;
    let duration = 2000;
    switch (imageState) {
      case 'feeding': animName = 'feeding'; break;
      case 'caress': animName = 'caress'; duration = 1500; break;
      case 'wash': animName = 'wash'; break;
      default: return;
    }
    if (animName) {
      triggerAnimation(animName, duration);
    }
  }, [imageState, isSleeping]);

  // 监听状态变化，自动更新动画
  useEffect(() => {
    updateAnimation();
  }, [isSleeping, happiness, hunger, cleanliness, energy]);

  // 高兴动画定时器（每30秒）
  useEffect(() => {
    const playHappy = () => {
      if (!isSleeping && !manualAnim && currentAnim === 'idle') {
        setCurrentAnim('happy');
        setIsLooping(false);
        animTimer.current = setTimeout(() => {
          updateAnimation();
        }, 2000);
      }
      happyTimer.current = setTimeout(playHappy, 30000);
    };
    happyTimer.current = setTimeout(playHappy, 30000);
    return () => clearTimers();
  }, [isSleeping, manualAnim, currentAnim]);

  // 点击宠物头部
  const handlePress = () => {
    if (isSleeping) return;
    triggerAnimation('caress', 1500);
    if (onCaress) onCaress();
  };

  const source = ANIMATIONS[currentAnim] || ANIMATIONS.idle;
  const shouldLoop = isLooping && currentAnim !== 'happy' && currentAnim !== 'hungry' && currentAnim !== 'dirty' && currentAnim !== 'sick' && currentAnim !== 'sad' && !manualAnim;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <View style={styles.container}>
        <LottieView
          source={source}
          style={styles.animation}
          autoPlay
          loop={shouldLoop}
          speed={0.6}
        />
      </View>
    </TouchableOpacity>
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