import React from 'react';
import { Image, StyleSheet } from 'react-native';

// 根据品种和状态获取对应的图片路径
const getImageSource = (breed, state) => {
  // 这里假设你的图片都存放在 ./images/[品种]/[状态].png
  // 如果实际图片命名不同，请自行修改
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

export default function PetImage({ petBreed, imageState }) {
  return (
    <Image
      source={getImageSource(petBreed, imageState)}
      style={styles.petImage}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  petImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
});