import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  AppState,
  Platform,
  ImageBackground,
} from 'react-native';
import Tts from 'react-native-tts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';

// 导入配置
import { BREEDS } from './src/config/breeds';
import { RARITY } from './src/config/rarity';
import { petPhrases } from './src/config/phrases';
import { ITEMS } from './src/config/items';

// 导入工具
import { initializeTTS, getVoiceConfig } from './src/utils/ttsHelper';
import { getNextStage, getStageName } from './src/utils/evolution';
import { getImageState } from './src/utils/imageHelper';

// 导入组件
import Header from './src/components/Header';
import MessageBubble from './src/components/MessageBubble';
import ShopModal from './src/components/ShopModal';
import BackpackModal from './src/components/BackpackModal';
import ActionChoiceModal from './src/components/ActionChoiceModal';
import SideButton from './src/components/SideButton';
import BottomBar from './src/components/BottomBar';
import UnifiedPet from './src/components/UnifiedPet';

// 导入自定义 Hook
import useInventory from './src/hooks/useInventory';

export default function App() {
  // ========== 宠物属性状态 ==========
  const [petBreed, setPetBreed] = useState('cat');
  const [stage, setStage] = useState('baby');
  const [rarity, setRarity] = useState(1);
  const [exp, setExp] = useState(0);
  const [hunger, setHunger] = useState(80);
  const [happiness, setHappiness] = useState(80);
  const [cleanliness, setCleanliness] = useState(80);
  const [energy, setEnergy] = useState(80);
  const [message, setMessage] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState(null);

  // ========== 弹窗状态 ==========
  const [shopVisible, setShopVisible] = useState(false);
  const [backpackVisible, setBackpackVisible] = useState(false);
  const [actionChoiceVisible, setActionChoiceVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  
  // ========== 动画触发状态 ==========
  const [triggerAnim, setTriggerAnim] = useState(null);

  // ========== 金币系统 ==========
  const { coins, items, addCoins, spendCoins, addItem, useItem, setInventory } = useInventory();

  // ========== 音乐相关 ==========
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const backgroundMusic = useRef(null);

  // ========== 数据持久化 ==========
  const SAVE_KEY = 'petGameData';

  const loadGameData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(SAVE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        setPetBreed(data.petBreed || 'cat');
        setStage(data.stage || 'baby');
        setRarity(data.rarity || 1);
        setExp(data.exp || 0);
        setHunger(data.hunger || 80);
        setHappiness(data.happiness || 80);
        setCleanliness(data.cleanliness || 80);
        setEnergy(data.energy || 80);
        setIsSleeping(data.isSleeping || false);
        setSleepStartTime(data.sleepStartTime || null);
        if (data.coins !== undefined && data.items) {
          setInventory(data.coins, data.items);
        }
      }
    } catch (error) {
      console.error('加载游戏数据失败', error);
    }
  };

  const saveGameData = async () => {
    try {
      const dataToSave = {
        petBreed,
        stage,
        rarity,
        exp,
        hunger,
        happiness,
        cleanliness,
        energy,
        isSleeping,
        sleepStartTime,
        coins,
        items,
      };
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('保存游戏数据失败', error);
    }
  };

  // ========== 触发动画 ==========
  const triggerAnimation = (animType, duration = 2000) => {
    console.log(`🎬 触发动画: ${animType}`);
    setTriggerAnim(animType);
    setTimeout(() => setTriggerAnim(null), duration);
  };

  // ========== 道具相关 ==========
  const handleBuyItem = (item) => {
    if (spendCoins(item.price)) {
      addItem(item.id);
      Alert.alert('购买成功', `你获得了 ${item.name}！`);
    } else {
      Alert.alert('金币不足', '快去赚金币吧～');
    }
  };

  const handleUseItem = (itemId) => {
    const item = ITEMS[itemId];
    if (!item) return;
    if (useItem(itemId)) {
      if (item.effect.hunger) setHunger(prev => Math.min(100, prev + item.effect.hunger));
      if (item.effect.happiness) setHappiness(prev => Math.min(100, prev + item.effect.happiness));
      if (item.effect.energy) setEnergy(prev => Math.min(100, prev + item.effect.energy));
      if (item.effect.exp) setExp(prev => prev + item.effect.exp);
      speak(`使用了 ${item.name}！效果拔群～`, 'happy');
      
      if (item.type === 'feed') triggerAnimation('feeding', 2000);
      else if (item.type === 'play') triggerAnimation('caress', 1500);
      else if (item.type === 'clean') triggerAnimation('wash', 2000);
    } else {
      Alert.alert('没有该道具', '先去商店购买吧');
    }
  };

  // ========== 普通动作 ==========
  const performNormalFeed = () => {
    console.log('🍖 执行普通喂食');
    if (isSleeping) { speak('呼噜呼噜...在睡觉呢', 'sleep'); return; }
    if (energy < 10) { speak('嗯...让我休息一下嘛', 'sad'); return; }
    setHunger(prev => Math.min(100, prev + 20));
    setExp(prev => prev + 10);
    setEnergy(prev => prev - 1);
    if (Math.random() < 0.3) {
      const coinAmount = Math.floor(Math.random() * 5) + 1;
      addCoins(coinAmount);
      speak(`哇！捡到 ${coinAmount} 金币～`, 'happy');
    } else {
      speakRandom('feed', 'feed');
    }
    triggerAnimation('feeding', 2000);
  };

  const performNormalPlay = () => {
    console.log('🎾 执行普通玩耍');
    if (isSleeping) { speak('呼噜呼噜...在睡觉呢', 'sleep'); return; }
    if (energy < 15) { speak('玩不动啦，好累哦', 'sad'); return; }
    setHappiness(prev => Math.min(100, prev + 15));
    setExp(prev => prev + 15);
    setEnergy(prev => prev - 5);
    if (Math.random() < 0.3) {
      const coinAmount = Math.floor(Math.random() * 5) + 1;
      addCoins(coinAmount);
      speak(`玩耍时找到 ${coinAmount} 金币！`, 'happy');
    } else {
      speakRandom('play', 'play');
    }
    triggerAnimation('caress', 1500);
  };

  const performNormalClean = () => {
    console.log('🧼 执行普通清洁');
    if (isSleeping) { speak('呼噜呼噜...在睡觉呢', 'sleep'); return; }
    if (energy < 5) { speak('太累啦，洗不动了啦', 'sad'); return; }
    setCleanliness(prev => Math.min(100, prev + 20));
    setEnergy(prev => prev - 1);
    if (Math.random() < 0.3) {
      const coinAmount = Math.floor(Math.random() * 5) + 1;
      addCoins(coinAmount);
      speak(`洗澡时冲出来 ${coinAmount} 金币！`, 'happy');
    } else {
      speakRandom('clean', 'clean');
    }
    triggerAnimation('wash', 2000);
  };

  // ========== 按钮处理 ==========
  const handleFeed = () => {
    console.log('🍖 喂食按钮被点击，打开弹窗');
    setCurrentAction('feed');
    setActionChoiceVisible(true);
  };

  const handlePlay = () => {
    console.log('🎾 玩耍按钮被点击，打开弹窗');
    setCurrentAction('play');
    setActionChoiceVisible(true);
  };

  const handleClean = () => {
    console.log('🧼 清洁按钮被点击，打开弹窗');
    setCurrentAction('clean');
    setActionChoiceVisible(true);
  };

  const handleSleep = () => {
    if (!isSleeping) {
      setIsSleeping(true);
      setSleepStartTime(Date.now());
      setHappiness(prev => Math.max(0, prev - 5));
      speakRandom('sleep', 'sleep');
    }
  };

  const handleWakeUp = () => {
    if (!isSleeping) { speak('我没有在睡觉呀～', 'wake'); return; }
    if (energy < 50) { speak('精力不足，叫不醒...', 'sleep'); return; }
    const sleepDuration = sleepStartTime ? (Date.now() - sleepStartTime) / 60000 : 0;
    if (sleepDuration >= 3 || energy >= 80) {
      setIsSleeping(false);
      setSleepStartTime(null);
      speakRandom('wake', 'wake');
    } else {
      const remainingTime = Math.ceil(3 - sleepDuration);
      speak(`唔...再睡${remainingTime}分钟嘛`, 'sleep');
    }
  };

  const handleReborn = () => {
    console.log('🔄 重生按钮被点击');
    Alert.alert(
      '真的要重生吗？',
      '重生后我会回到小宝宝，但是会记得你哦～',
      [
        { text: '不要啦', style: 'cancel' },
        {
          text: '重生吧',
          onPress: () => {
            setStage('baby');
            setRarity(1);
            setExp(0);
            setHunger(80);
            setHappiness(80);
            setCleanliness(80);
            setEnergy(80);
            setIsSleeping(false);
            setSleepStartTime(null);
            const msg = `重生成功啦！我记得你哦，主人～`;
            setMessage(msg);
            setMessageVisible(true);
            setTimeout(() => setMessageVisible(false), 3000);
            const voiceConfig = getVoiceConfig('greeting', 'baby');
            Tts.setDefaultRate(voiceConfig.rate);
            Tts.setDefaultPitch(voiceConfig.pitch);
            Tts.speak(msg);
            Alert.alert('重生啦', msg);
          }
        }
      ]
    );
  };

  const handleSign = async () => {
    console.log('📅 签到按钮被点击');
    try {
      const today = new Date().toDateString();
      const lastSignDate = await AsyncStorage.getItem('lastSignDate');
      if (lastSignDate === today) {
        Alert.alert('今天已经签到过了', '明天再来吧～');
        return;
      }
      await AsyncStorage.setItem('lastSignDate', today);
      addCoins(50);
      speak('签到成功，获得 50 金币！', 'happy');
    } catch (error) {
      console.error('签到失败', error);
      Alert.alert('签到失败', '请稍后再试');
    }
  };

  const toggleMusic = () => {
    if (backgroundMusic.current) {
      if (isMusicPlaying) {
        backgroundMusic.current.pause();
      } else {
        backgroundMusic.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const changeBreed = (breed) => {
    setPetBreed(breed);
    const msg = `我是${BREEDS[breed].name}，请多关照呀～`;
    speak(msg, 'greeting');
  };

  // ========== useEffect ==========
  useEffect(() => { loadGameData(); }, []);
  useEffect(() => { saveGameData(); }, [petBreed, stage, rarity, exp, hunger, happiness, cleanliness, energy, isSleeping, sleepStartTime, coins, items]);

  useEffect(() => {
    Sound.setCategory('Playback', true);
    const music = new Sound(
      Platform.OS === 'android' ? 'bgm' : require('./assets/music/bgm.mp3'),
      Platform.OS === 'android' ? Sound.MAIN_BUNDLE : '',
      (error) => {
        if (error) { console.log('❌ 背景音乐加载失败', error); return; }
        console.log('✅ 背景音乐加载成功');
        music.setNumberOfLoops(-1);
        music.setVolume(0.5);
        music.play();
      }
    );
    backgroundMusic.current = music;
    return () => { if (backgroundMusic.current) backgroundMusic.current.release(); };
  }, []);

  useEffect(() => {
    initializeTTS();
    const timer = setTimeout(() => speakRandom('greeting', 'greeting'), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isSleeping) {
        setHunger(prev => Math.max(0, prev - 2));
        setHappiness(prev => Math.max(0, prev - 1));
        setCleanliness(prev => Math.max(0, prev - 1));
        setEnergy(prev => Math.max(0, prev - 1));
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [isSleeping]);

  useEffect(() => {
    if (isSleeping) {
      const timer = setInterval(() => {
        setEnergy(prev => {
          const newEnergy = Math.min(100, prev + 1);
          if (newEnergy >= 100) {
            setIsSleeping(false);
            setSleepStartTime(null);
            speak('精力满满，起床啦！', 'wake');
          }
          return newEnergy;
        });
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [isSleeping]);

  useEffect(() => {
    const result = getNextStage(stage, exp, RARITY[rarity].multiplier);
    if (result.stage !== stage) {
      setStage(result.stage);
      setRarity(result.rarity);
      const stageName = getStageName(result.stage);
      const quality = RARITY[result.rarity].name;
      const msg = `哇！我变成${stageName}啦，是${quality}品质哦！`;
      setMessage(msg);
      setMessageVisible(true);
      setTimeout(() => setMessageVisible(false), 3000);
      const voiceConfig = getVoiceConfig('evolution', result.stage);
      Tts.setDefaultRate(voiceConfig.rate);
      Tts.setDefaultPitch(voiceConfig.pitch);
      Tts.speak(msg);
      Alert.alert('进化啦！', msg);
    }
  }, [exp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSleeping) {
        if (hunger < 30 && hunger > 0) speakRandom('hungry', 'sad');
        else if (happiness < 30 && happiness > 0) speakRandom('sad', 'sad');
        else if (cleanliness < 30 && cleanliness > 0) speakRandom('dirty', 'sad');
        else if (energy < 30 && energy > 0) speakRandom('sick', 'sad');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [hunger, happiness, cleanliness, energy, isSleeping]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        if (backgroundMusic.current && isMusicPlaying) backgroundMusic.current.pause();
        saveGameData();
      } else if (nextAppState === 'active') {
        if (backgroundMusic.current && isMusicPlaying) backgroundMusic.current.play();
      }
    });
    return () => subscription.remove();
  }, [isMusicPlaying]);

  // ========== 说话函数 ==========
  const speak = (text, action = 'default') => {
    setMessage(text);
    setMessageVisible(true);
    setTimeout(() => setMessageVisible(false), 3000);
    const voiceConfig = getVoiceConfig(action, stage);
    let finalText = text;
    if (action !== 'greeting' && action !== 'evolution') {
      const breed = BREEDS[petBreed];
      finalText = `${breed.sound} ${text}`;
    }
    setTimeout(() => {
      try {
        Tts.setDefaultRate(voiceConfig.rate);
        Tts.setDefaultPitch(voiceConfig.pitch);
        Tts.speak(finalText);
      } catch (err) { console.log('TTS暂时不可用:', err); }
    }, 100);
  };

  const speakRandom = (type, action = type) => {
    const phrases = petPhrases[type] || ['...'];
    const randomIndex = Math.floor(Math.random() * phrases.length);
    speak(phrases[randomIndex], action);
  };

  const staticImageState = getImageState(hunger, happiness, cleanliness, energy, isSleeping);

  // ========== 渲染 ==========
  return (
    <ImageBackground source={require('./assets/backgrounds/indoor.png')} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
        <Header petBreed={petBreed} rarity={rarity} onBreedChange={changeBreed} coins={coins} />

        <View style={styles.middle}>
          <View style={styles.leftButtons}>
            <SideButton imageSource={require('./images/icons/food.png')} label="喂食" onPress={handleFeed} />
            <SideButton imageSource={require('./images/icons/play.png')} label="玩耍" onPress={handlePlay} />
          </View>

          <View style={styles.petContainer}>
            <MessageBubble message={message} visible={messageVisible} isSleeping={isSleeping} />
            <UnifiedPet
              petBreed={petBreed}
              imageState={triggerAnim}
              isSleeping={isSleeping}
              happiness={happiness}
              hunger={hunger}
              cleanliness={cleanliness}
              energy={energy}
              onCaress={() => {
                console.log('🤚 抚摸宠物');
                setHappiness(prev => Math.min(100, prev + 8));
                speak('喵～好舒服呀', 'happy');
                triggerAnimation('caress', 1500);
              }}
            />
          </View>

          <View style={styles.rightButtons}>
            <SideButton imageSource={require('./images/icons/clean.png')} label="清洁" onPress={handleClean} />
            <SideButton imageSource={require('./images/icons/sleep.png')} label="睡觉" onPress={handleSleep} />
            <SideButton imageSource={require('./images/icons/wake.png')} label="唤醒" onPress={handleWakeUp} />
          </View>
        </View>

        <BottomBar
          hunger={hunger}
          happiness={happiness}
          cleanliness={cleanliness}
          energy={energy}
          onShop={() => setShopVisible(true)}
          onBackpack={() => setBackpackVisible(true)}
          onReborn={handleReborn}
          onSign={handleSign}
          onMusicToggle={toggleMusic}
          isMusicPlaying={isMusicPlaying}
        />

        <ShopModal visible={shopVisible} onClose={() => setShopVisible(false)} coins={coins} items={items} onBuy={handleBuyItem} onUseItem={handleUseItem} />
        <BackpackModal visible={backpackVisible} onClose={() => setBackpackVisible(false)} items={items} onUseItem={handleUseItem} />
        <ActionChoiceModal
          visible={actionChoiceVisible}
          onClose={() => setActionChoiceVisible(false)}
          items={items}
          actionType={currentAction}
          onUseItem={handleUseItem}
          onNormalAction={() => {
            console.log(`🎬 执行普通动作: ${currentAction}`);
            if (currentAction === 'feed') performNormalFeed();
            else if (currentAction === 'play') performNormalPlay();
            else if (currentAction === 'clean') performNormalClean();
          }}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  middle: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  leftButtons: { width: 60, alignItems: 'center', marginRight: 2, marginTop: -300 },
  rightButtons: { width: 60, alignItems: 'center', marginLeft: 2, marginTop: -300 },
  petContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 250 },
});