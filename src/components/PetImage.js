import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

// 根据品种和状态获取对应的图片路径（这部分保持不变）
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

export default function PetImage({ petBreed, imageState, happiness }) {
  // 创建动画值
  const breathScale = useRef(new Animated.Value(1)).current;        // 呼吸缩放
  const jumpTranslateY = useRef(new Animated.Value(0)).current;    // 跳跃位移
  const prevHappiness = useRef(happiness);                         // 记录上一次的快乐值

  // 呼吸动画（持续循环）
  useEffect(() => {
    const breathAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, {
          toValue: 1.05,                     // 放大到 1.05 倍
          duration: 2000,                     // 2 秒完成
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,               // 使用原生驱动，性能更好
        }),
        Animated.timing(breathScale, {
          toValue: 1,                          // 恢复原大小
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathAnimation.start();

    // 组件卸载时停止动画
    return () => breathAnimation.stop();
  }, [breathScale]);

  // 高兴跳跃动画（当快乐值超过 80 时触发一次）
  useEffect(() => {
    // 如果当前快乐 > 80，且上一次快乐 <= 80，说明刚进入高兴状态
    if (happiness > 80 && prevHappiness.current <= 80) {
      // 触发跳跃动画：先向上跳，再落回
      Animated.sequence([
        Animated.timing(jumpTranslateY, {
          toValue: -20,                        // 向上移动 20 像素
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(jumpTranslateY, {
          toValue: 0,                          // 回到原位
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
    // 更新上一次快乐值
    prevHappiness.current = happiness;
  }, [happiness, jumpTranslateY]);

  // 组合动画样式
  const animatedStyle = {
    transform: [
      { scale: breathScale },      // 呼吸缩放
      { translateY: jumpTranslateY }, // 跳跃位移
    ],
  };

  return (
    <Animated.Image
      source={getImageSource(petBreed, imageState)}
      style={[styles.petImage, animatedStyle]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  petImage: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginBottom: 10,
  },
});