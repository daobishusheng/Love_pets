import AsyncStorage from '@react-native-async-storage/async-storage';

// 保存游戏数据
export const saveGameData = async (data) => {
  try {
    const dataToSave = {
      ...data,
      lastSaveTime: Date.now(),
    };
    const jsonValue = JSON.stringify(dataToSave);
    await AsyncStorage.setItem('@Love_pets_data', jsonValue);
    console.log('✅ 游戏数据保存成功');
    return true;
  } catch (e) {
    console.log('❌ 保存失败:', e);
    return false;
  }
};

// 加载游戏数据
export const loadGameData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@Love_pets_data');
    if (jsonValue != null) {
      console.log('✅ 游戏数据加载成功');
      return JSON.parse(jsonValue);
    }
    console.log('ℹ️ 没有找到保存的数据');
    return null;
  } catch (e) {
    console.log('❌ 加载失败:', e);
    return null;
  }
};

// 清除所有数据
export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem('@Love_pets_data');
    console.log('✅ 数据已清除');
    return true;
  } catch (e) {
    console.log('❌ 清除失败:', e);
    return false;
  }
};