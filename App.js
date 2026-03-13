import { Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Tts from 'react-native-tts';

// 导入配置
import { BREEDS } from './src/config/breeds';
import { RARITY } from './src/config/rarity';
import { petPhrases } from './src/config/phrases';

// 导入工具
import { initializeTTS, getVoiceConfig } from './src/utils/ttsHelper';
import { getNextStage, getStageName } from './src/utils/evolution';
import { getImageState } from './src/utils/imageHelper';

// 导入组件
import Header from './src/components/Header';
import PetImage from './src/components/PetImage';
import MessageBubble from './src/components/MessageBubble';
import StatusBars from './src/components/StatusBars';
import ActionButtons from './src/components/ActionButtons';

export default function App() {
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

  // 初始化TTS
  useEffect(() => {
    initializeTTS();
    
    const timer = setTimeout(() => {
      speakRandom('greeting', 'greeting');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // 随时间衰减
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isSleeping) {
        setHunger(prev => Math.max(0, prev - 2));
        setHappiness(prev => Math.max(0, prev - 1));
        setCleanliness(prev => Math.max(0, prev - 1));
        setEnergy(prev => Math.max(0, prev - 1));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isSleeping]);

  // 检查进化
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

  // 根据状态自动触发台词
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSleeping) {
        if (hunger < 30 && hunger > 0) {
          speakRandom('hungry', 'sad');
        } else if (happiness < 30 && happiness > 0) {
          speakRandom('sad', 'sad');
        } else if (cleanliness < 30 && cleanliness > 0) {
          speakRandom('dirty', 'sad');
        } else if (energy < 30 && energy > 0) {
          speakRandom('sick', 'sad');
        }
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [hunger, happiness, cleanliness, energy, isSleeping]);

  // 说话函数
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
      } catch (err) {
        console.log('TTS暂时不可用:', err);
      }
    }, 100);
  };

  // 随机说话
  const speakRandom = (type, action = type) => {
    const phrases = petPhrases[type] || ['...'];
    const randomIndex = Math.floor(Math.random() * phrases.length);
    speak(phrases[randomIndex], action);
  };

  // 喂食
  const handleFeed = () => {
    if (isSleeping) {
      speak('呼噜呼噜...在睡觉呢', 'sleep');
      return;
    }
    if (energy < 10) {
      speak('嗯...让我休息一下嘛', 'sad');
      return;
    }
    setHunger(prev => Math.min(100, prev + 20));
    setExp(prev => prev + 10);
    setEnergy(prev => prev - 5);
    speakRandom('feed', 'feed');
  };

  // 玩耍
  const handlePlay = () => {
    if (isSleeping) {
      speak('呼噜呼噜...在睡觉呢', 'sleep');
      return;
    }
    if (energy < 15) {
      speak('玩不动啦，好累哦', 'sad');
      return;
    }
    setHappiness(prev => Math.min(100, prev + 15));
    setExp(prev => prev + 15);
    setEnergy(prev => prev - 10);
    speakRandom('play', 'play');
  };

  // 清洁
  const handleClean = () => {
    if (isSleeping) {
      speak('呼噜呼噜...在睡觉呢', 'sleep');
      return;
    }
    if (energy < 5) {
      speak('太累啦，洗不动了啦', 'sad');
      return;
    }
    setCleanliness(prev => Math.min(100, prev + 20));
    setEnergy(prev => prev - 3);
    speakRandom('clean', 'clean');
  };

  // 睡觉
  const handleSleep = () => {
    if (!isSleeping) {
      setIsSleeping(true);
      setSleepStartTime(Date.now());
      setEnergy(prev => Math.min(100, prev + 30));
      setHappiness(prev => Math.max(0, prev - 5));
      speakRandom('sleep', 'sleep');
    }
  };

  // 唤醒
  const handleWakeUp = () => {
    if (!isSleeping) {
      speak('我没有在睡觉呀～', 'wake');
      return;
    }
    
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

  // 重生
  const handleReborn = () => {
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

  // 切换品种
  const changeBreed = (breed) => {
    setPetBreed(breed);
    const msg = `我是${BREEDS[breed].name}，请多关照呀～`;
    speak(msg, 'greeting');
  };

  const imageState = getImageState(hunger, happiness, cleanliness, energy, isSleeping);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
      
      <Header
        petBreed={petBreed}
        rarity={rarity}
        onBreedChange={changeBreed}
      />

      <PetImage
        petBreed={petBreed}
        imageState={imageState}
      />

      <MessageBubble
        message={message}
        visible={messageVisible}
        isSleeping={isSleeping}
      />

      <StatusBars
        hunger={hunger}
        happiness={happiness}
        cleanliness={cleanliness}
        energy={energy}
        exp={exp}
        stage={stage}
      />

      <ActionButtons
        onFeed={handleFeed}
        onPlay={handlePlay}
        onClean={handleClean}
        onSleep={handleSleep}
        onWake={handleWakeUp}
        onReborn={handleReborn}
        isSleeping={isSleeping}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    padding: 20,
  },
});