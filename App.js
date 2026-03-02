import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';

// 宠物品种配置
const BREEDS = {
  cat: { name: '喵喵', baseColor: '#FFA07A' },
  dog: { name: '汪汪', baseColor: '#8B4513' },
  fox: { name: '狐狐', baseColor: '#FF6346' },
};

// 品质配置
const RARITY = {
  1: { name: '普通', color: '#A0A0A0', multiplier: 1.0 },
  2: { name: '稀有', color: '#4169E1', multiplier: 1.2 },
  3: { name: '史诗', color: '#9B30FF', multiplier: 1.5 },
  4: { name: '传说', color: '#FFD700', multiplier: 2.0 },
};

// 进化逻辑
const getNextStage = (currentStage, exp, rarityMultiplier) => {
  const stageThresholds = {
    baby: { next: 'child', exp: 100 },
    child: { next: 'teen', exp: 300 },
    teen: { next: 'adult', exp: 600 },
    adult: { next: 'legend', exp: 1000 },
  };

  if (currentStage === 'legend') return currentStage;

  const threshold = stageThresholds[currentStage];
  if (exp >= threshold.exp * rarityMultiplier) {
    const rand = Math.random();
    if (rand > 0.99) return { stage: threshold.next, rarity: 4 };
    if (rand > 0.95) return { stage: threshold.next, rarity: 3 };
    if (rand > 0.80) return { stage: threshold.next, rarity: 2 };
    return { stage: threshold.next, rarity: 1 };
  }
  return { stage: currentStage, rarity: 1 };
};

export default function App() {
  const [petBreed, setPetBreed] = useState('cat');
  const [stage, setStage] = useState('baby');
  const [rarity, setRarity] = useState(1);
  const [exp, setExp] = useState(0);
  const [hunger, setHunger] = useState(80);
  const [happiness, setHappiness] = useState(80);
  const [energy, setEnergy] = useState(80);

  // 随时间自然衰减
  useEffect(() => {
    const timer = setInterval(() => {
      setHunger(prev => Math.max(0, prev - 2));
      setHappiness(prev => Math.max(0, prev - 1));
      setEnergy(prev => Math.max(0, prev - 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 检查进化条件
  useEffect(() => {
    const result = getNextStage(stage, exp, RARITY[rarity].multiplier);
    if (result.stage !== stage) {
      setStage(result.stage);
      setRarity(result.rarity);
      Alert.alert('🎉 进化啦！', `你的宠物进化成${
        result.stage === 'baby' ? '婴儿期' :
        result.stage === 'child' ? '儿童期' :
        result.stage === 'teen' ? '少年期' : '青年期'
      }，品质：${RARITY[result.rarity].name}`);
    }
  }, [exp]);

  const handleFeed = () => {
    if (energy < 10) {
      Alert.alert('精力不足', '宠物太累了，先让它休息吧');
      return;
    }
    setHunger(prev => Math.min(100, prev + 20));
    setExp(prev => prev + 10);
    setEnergy(prev => prev - 5);
  };

  const handlePlay = () => {
    if (energy < 15) {
      Alert.alert('精力不足', '宠物太累了，先让它休息吧');
      return;
    }
    setHappiness(prev => Math.min(100, prev + 15));
    setExp(prev => prev + 15);
    setEnergy(prev => prev - 10);
  };

  const handleSleep = () => {
    setEnergy(prev => Math.min(100, prev + 30));
    setHappiness(prev => Math.max(0, prev - 5));
  };

  const handleReborn = () => {
    Alert.alert(
      '确认重生',
      '重生后宠物将回到婴儿期，但会保留前世印记。确定吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            const previousRarity = rarity;
            setStage('baby');
            setRarity(1);
            setExp(0);
            setHunger(80);
            setHappiness(80);
            setEnergy(80);
            Alert.alert('重生成功', `获得前世印记：初始属性 + ${previousRarity * 5}%`);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 头部信息：品种+阶段+品质 */}
      <View style={styles.header}>
        <Text style={styles.title}>{BREEDS[petBreed].name}</Text>
        <View style={[styles.rarityBadge, { backgroundColor: RARITY[rarity].color }]}>
          <Text style={styles.rarityText}>
            {rarity === 1 ? '普通' : rarity === 2 ? '稀有' : rarity === 3 ? '史诗' : '传说'}
          </Text>
        </View>
      </View>

      {/* 宠物图片 */}
      <Image
        source={
          petBreed === 'cat' ? require('./images/cat/happy.png') :
          petBreed === 'dog' ? require('./images/dog/happy.png') :
          require('./images/fox/happy.png')
        }
        style={{ width: 200, height: 200, alignSelf: 'center', marginBottom: 10 }}
        resizeMode="contain"
      />

      <Text style={styles.stageText}>
        阶段：{stage === 'baby' ? '婴儿期' : stage === 'child' ? '儿童期' : stage === 'teen' ? '少年期' : '青年期'}
      </Text>

      {/* 属性条 */}
      <View style={styles.stats}>
        <Text>饱食度: {hunger}</Text>
        <View style={styles.progressBar}><View style={[styles.progress, { width: `${hunger}%`, backgroundColor: '#4CAF50' }]} /></View>
        <Text>快乐度: {happiness}</Text>
        <View style={styles.progressBar}><View style={[styles.progress, { width: `${happiness}%`, backgroundColor: '#FF9800' }]} /></View>
        <Text>精力: {energy}</Text>
        <View style={styles.progressBar}><View style={[styles.progress, { width: `${energy}%`, backgroundColor: '#2196F3' }]} /></View>
        <Text>经验值: {exp}</Text>
      </View>

      {/* 互动按钮 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.feed]} onPress={handleFeed}><Text>🍖喂食</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.play]} onPress={handlePlay}><Text>🎾玩耍</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.sleep]} onPress={handleSleep}><Text>😴睡觉</Text></TouchableOpacity>
      </View>

      {/* 重生按钮 */}
      <TouchableOpacity style={styles.rebornButton} onPress={handleReborn}>
        <Text style={styles.rebornText}>🔄 重生转世</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  rarityBadge: { padding: 5, borderRadius: 10, minWidth: 60, alignItems: 'center' },
  rarityText: { color: 'white', fontWeight: 'bold' },
  stageText: { fontSize: 16, marginBottom: 20, color: '#666' },
  stats: { marginBottom: 30 },
  progressBar: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, marginVertical: 5 },
  progress: { height: '100%', borderRadius: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  button: { padding: 15, borderRadius: 10, minWidth: 80, alignItems: 'center' },
  feed: { backgroundColor: '#4CAF50' },
  play: { backgroundColor: '#FF9800' },
  sleep: { backgroundColor: '#2196F3' },
  rebornButton: { padding: 15, backgroundColor: '#9C27B0', borderRadius: 10, alignItems: 'center' },
  rebornText: { color: 'white', fontWeight: 'bold' },
});