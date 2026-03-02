import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import Tts from 'react-native-tts'; // 语音库

// 宠物品种配置
const BREEDS = {
  cat: { name: '喵喵', sound: '喵呜', emoji: '🐱' },
  dog: { name: '汪汪', sound: '汪汪', emoji: '🐶' },
  fox: { name: '狐狐', sound: '嗷呜~', emoji: '🦊' },
};

// 品质配置
const RARITY = {
  1: { name: '普通', color: '#A0A0A0', multiplier: 1.0 },
  2: { name: '稀有', color: '#4169E1', multiplier: 1.2 },
  3: { name: '史诗', color: '#9B30FF', multiplier: 1.5 },
  4: { name: '传说', color: '#FFD700', multiplier: 2.0 },
};

// 阶段对应的音调参数 (语速、音调)
const STAGE_VOICE = {
  baby: { speed: 1.2, pitch: 1.5 },   // 婴儿：语速快，音调高
  child: { speed: 1.1, pitch: 1.2 },
  teen: { speed: 1.0, pitch: 1.0 },
  adult: { speed: 0.9, pitch: 0.8 },  // 青年：语速慢，音调低
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
    if (rand > 0.99) return { stage: threshold.next, rarity: 4 }; // 1% 传说
    if (rand > 0.95) return { stage: threshold.next, rarity: 3 }; // 4% 史诗
    if (rand > 0.80) return { stage: threshold.next, rarity: 2 }; // 15% 稀有
    return { stage: threshold.next, rarity: 1 }; // 80% 普通
  }
  return { stage: currentStage, rarity: 1 };
};

// 根据阶段获取中文名称
const getStageName = (stage) => {
  switch (stage) {
    case 'baby': return '婴儿期';
    case 'child': return '儿童期';
    case 'teen': return '少年期';
    case 'adult': return '青年期';
    default: return '未知';
  }
};

export default function App() {
  const [petBreed, setPetBreed] = useState('cat');
  const [stage, setStage] = useState('baby');
  const [rarity, setRarity] = useState(1);
  const [exp, setExp] = useState(0);
  const [hunger, setHunger] = useState(80);
  const [happiness, setHappiness] = useState(80);
  const [cleanliness, setCleanliness] = useState(80);
  const [energy, setEnergy] = useState(80);
  const [message, setMessage] = useState(''); // 当前显示的消息
  const [messageVisible, setMessageVisible] = useState(false);

  // 初始化 TTS（语音）
  useEffect(() => {
    Tts.setDefaultLanguage('zh-CN'); // 设置中文
    Tts.setDefaultRate(0.5); // 默认语速
    return () => {
      Tts.stop(); // 组件卸载时停止语音
    };
  }, []);

  // 随时间自然衰减
  useEffect(() => {
    const timer = setInterval(() => {
      setHunger(prev => Math.max(0, prev - 2));
      setHappiness(prev => Math.max(0, prev - 1));
      setCleanliness(prev => Math.max(0, prev - 1));
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
      const stageName = getStageName(result.stage);
      const quality = RARITY[result.rarity].name;
      const msg = `🎉 进化啦！变成${stageName}，品质：${quality}`;
      speak(msg);
      Alert.alert('进化啦！', msg);
    }
  }, [exp]);

  // 说话函数：显示文字并播放语音
  const speak = (text, isAction = false) => {
    // 如果是动作触发，加上宠物叫声前缀
    let finalText = text;
    if (isAction) {
      const breed = BREEDS[petBreed];
      finalText = `${breed.sound}！${text}`;
    }

    // 设置消息
    setMessage(finalText);
    setMessageVisible(true);
    setTimeout(() => setMessageVisible(false), 3000); // 3秒后消失

    // 根据阶段调整语速和音调
    const voice = STAGE_VOICE[stage];
    Tts.setDefaultRate(voice.speed);
    Tts.setDefaultPitch(voice.pitch);
    Tts.speak(finalText);
  };

  // 互动行为：喂食
  const handleFeed = () => {
    if (energy < 10) {
      speak('精力不足，先让我休息吧');
      return;
    }
    setHunger(prev => Math.min(100, prev + 20));
    setExp(prev => prev + 10);
    setEnergy(prev => prev - 5);
    const msgs = ['谢谢主人！真好吃', '饱饱的～', '主人最好了'];
    speak(msgs[Math.floor(Math.random() * msgs.length)], true);
  };

  // 玩耍
  const handlePlay = () => {
    if (energy < 15) {
      speak('玩不动了，好累');
      return;
    }
    setHappiness(prev => Math.min(100, prev + 15));
    setExp(prev => prev + 15);
    setEnergy(prev => prev - 10);
    const msgs = ['和主人玩真开心！', '再来一次嘛', '好嗨哟～'];
    speak(msgs[Math.floor(Math.random() * msgs.length)], true);
  };

  // 清洁
  const handleClean = () => {
    if (energy < 5) {
      speak('太累了，洗不动了');
      return;
    }
    setCleanliness(prev => Math.min(100, prev + 20));
    setEnergy(prev => prev - 3);
    const msgs = ['洗完澡真舒服', '香喷喷啦', '主人好细心'];
    speak(msgs[Math.floor(Math.random() * msgs.length)], true);
  };

  // 睡觉
  const handleSleep = () => {
    setEnergy(prev => Math.min(100, prev + 30));
    setHappiness(prev => Math.max(0, prev - 5));
    speak('呼噜呼噜...', true);
  };

  // 重生
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
            setCleanliness(80);
            setEnergy(80);
            const msg = `重生成功！获得前世印记：初始属性 + ${previousRarity * 5}%`;
            speak(msg);
            Alert.alert('重生成功', msg);
          }
        }
      ]
    );
  };

  // 切换宠物品种
  const changeBreed = (breed) => {
    setPetBreed(breed);
    const msg = `我是${BREEDS[breed].name}`;
    speak(msg);
  };

  // 获取当前宠物图片（根据品种和心情简单对应，这里暂用同一张 happy 图，你可以根据心情替换）
  const getImageSource = () => {
    // 简单起见，始终用 happy 图片，后续可根据心情更换
    switch (petBreed) {
      case 'cat': return require('./images/cat/happy.png');
      case 'dog': return require('./images/dog/happy.png');
      case 'fox': return require('./images/fox/happy.png');
      default: return require('./images/cat/happy.png');
    }
  };

  return (
    <View style={styles.container}>
      {/* 头部：品种选择和品质标签 */}
      <View style={styles.header}>
        <View style={styles.breedSelector}>
          {Object.keys(BREEDS).map(breed => (
            <TouchableOpacity
              key={breed}
              style={[styles.breedButton, petBreed === breed && styles.activeBreed]}
              onPress={() => changeBreed(breed)}>
              <Text style={styles.breedText}>{BREEDS[breed].emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.rarityBadge, { backgroundColor: RARITY[rarity].color }]}>
          <Text style={styles.rarityText}>{RARITY[rarity].name}</Text>
        </View>
      </View>

      {/* 宠物图片 */}
      <Image source={getImageSource()} style={styles.petImage} resizeMode="contain" />

      {/* 阶段显示 */}
      <Text style={styles.stageText}>阶段：{getStageName(stage)}</Text>

      {/* 对话气泡 */}
      {messageVisible && (
        <View style={styles.messageBubble}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      {/* 属性条 */}
      <View style={styles.stats}>
        <Text>饱食度: {hunger}</Text>
        <View style={styles.progressBar}><View style={[styles.progress, { width: `${hunger}%`, backgroundColor: '#4CAF50' }]} /></View>
        <Text>快乐度: {happiness}</Text>
        <View style={styles.progressBar}><View style={[styles.progress, { width: `${happiness}%`, backgroundColor: '#FF9800' }]} /></View>
        <Text>清洁度: {cleanliness}</Text>
        <View style={styles.progressBar}><View style={[styles.progress, { width: `${cleanliness}%`, backgroundColor: '#2196F3' }]} /></View>
        <Text>精力: {energy}</Text>
        <View style={styles.progressBar}><View style={[styles.progress, { width: `${energy}%`, backgroundColor: '#9C27B0' }]} /></View>
        <Text>经验值: {exp}</Text>
      </View>

      {/* 互动按钮 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonScroll}>
        <TouchableOpacity style={[styles.button, styles.feed]} onPress={handleFeed}><Text>🍖喂食</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.play]} onPress={handlePlay}><Text>🎾玩耍</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.clean]} onPress={handleClean}><Text>🛁清洁</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.sleep]} onPress={handleSleep}><Text>😴睡觉</Text></TouchableOpacity>
      </ScrollView>

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
  breedSelector: { flexDirection: 'row' },
  breedButton: { padding: 10, marginRight: 5, backgroundColor: '#ddd', borderRadius: 20, width: 50, alignItems: 'center' },
  activeBreed: { backgroundColor: '#ffd700' },
  breedText: { fontSize: 20 },
  rarityBadge: { padding: 5, borderRadius: 10, minWidth: 60, alignItems: 'center' },
  rarityText: { color: 'white', fontWeight: 'bold' },
  petImage: { width: 200, height: 200, alignSelf: 'center', marginBottom: 10 },
  stageText: { fontSize: 16, marginBottom: 10, color: '#666', textAlign: 'center' },
  messageBubble: { backgroundColor: 'white', padding: 10, borderRadius: 20, marginBottom: 10, alignSelf: 'center', maxWidth: '80%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  messageText: { fontSize: 14, textAlign: 'center' },
  stats: { marginBottom: 20 },
  progressBar: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, marginVertical: 5 },
  progress: { height: '100%', borderRadius: 5 },
  buttonScroll: { marginBottom: 20 },
  button: { padding: 15, borderRadius: 10, minWidth: 80, alignItems: 'center', marginRight: 10 },
  feed: { backgroundColor: '#4CAF50' },
  play: { backgroundColor: '#FF9800' },
  clean: { backgroundColor: '#2196F3' },
  sleep: { backgroundColor: '#9C27B0' },
  rebornButton: { padding: 15, backgroundColor: '#FF5722', borderRadius: 10, alignItems: 'center' },
  rebornText: { color: 'white', fontWeight: 'bold' },
});