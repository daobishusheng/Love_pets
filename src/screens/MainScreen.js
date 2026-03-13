import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  BackHandler,
} from 'react-native';
import Tts from 'react-native-tts';
import PetWithAnimation from '../components/PetWithAnimation';
import AnimatedIconButton from '../components/AnimatedIconButton';
import ItemSelectModal from '../components/ItemSelectModal';
import { RARITY, getStageName, getNextStage, getImageState } from '../constants/pet';
import { loadGameData, saveGameData } from '../utils/storage';
import { getInitialGameState, buyItem, useItem, dailyCheckIn, completeTask, watchAd, buyVip, sleepEarn } from '../store/gameStore';

const MainScreen = () => {
  const [gameState, setGameState] = useState(getInitialGameState());
  const [message, setMessage] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showItemSelect, setShowItemSelect] = useState(false);
  const [currentAction, setCurrentAction] = useState('');

  // 初始化 TTS 语音
  useEffect(() => {
    const initTTS = async () => {
      try {
        await Tts.getInitStatus();
        Tts.setDefaultLanguage('zh-CN');
        Tts.setDefaultRate(0.4);
        Tts.setDefaultPitch(1.2);
        console.log('TTS 初始化成功');
      } catch (err) {
        console.log('TTS 初始化失败:', err);
      }
    };
    
    initTTS();
  }, []);

  // 加载保存的数据
  useEffect(() => {
    const initData = async () => {
      const savedData = await loadGameData();
      if (savedData) {
        const { lastSaveTime, ...gameData } = savedData;
        setGameState(gameData);
        showMessage('🏠 欢迎回来，主人！');
        speak('欢迎回来，主人！');
      } else {
        showMessage('🐱 你好呀，新主人！');
        speak('你好呀，新主人！');
      }
    };
    initData();
  }, []);

  // 自动保存（每30秒）
  useEffect(() => {
    const timer = setInterval(() => {
      saveGameData(gameState);
      console.log('💾 自动保存成功', new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(timer);
  }, [gameState]);

  // 状态衰减（每10秒）- 修复版：不再自动改变睡眠状态
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        // 只更新数值，不改变睡眠状态
        return {
          ...prev,
          hunger: Math.max(0, Math.min(100, prev.hunger - 1)),
          happiness: Math.max(0, Math.min(100, prev.happiness - 0.5)),
          cleanliness: Math.max(0, Math.min(100, prev.cleanliness - 0.5)),
          // 如果正在睡觉，精力恢复；否则精力减少
          energy: prev.isSleeping 
            ? Math.min(100, prev.energy + 2)
            : Math.max(0, prev.energy - 0.5),
        };
      });
    }, 10000);
    return () => clearInterval(timer);
  }, []); // 注意：依赖数组为空，不依赖任何状态

  // 检查进化
  useEffect(() => {
    const result = getNextStage(
      gameState.stage, 
      gameState.exp, 
      RARITY[gameState.rarity].multiplier
    );
    
    if (result.stage !== gameState.stage) {
      setGameState(prev => ({
        ...prev,
        stage: result.stage,
        rarity: result.rarity,
      }));
      const msg = `🎉 进化成${getStageName(result.stage)}啦！品质：${RARITY[result.rarity].name}`;
      showMessage(msg);
      speak(msg);
    }
  }, [gameState.exp]);

  // 睡觉赚金币（每分钟）
  useEffect(() => {
    let sleepTimer;
    if (gameState.isSleeping) {
      sleepTimer = setInterval(() => {
        setGameState(prev => sleepEarn(prev, 1));
      }, 60000);
    }
    return () => {
      if (sleepTimer) clearInterval(sleepTimer);
    };
  }, [gameState.isSleeping]);

  // 从道具弹窗打开商店
  const openShopFromModal = () => {
    setShowShop(true);
  };

  // 在 useEffect 中暴露给全局（用于ItemSelectModal调用）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.openShop = openShopFromModal;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.openShop;
      }
    };
  }, []);

  const speak = (text) => {
    try {
      Tts.speak(text);
    } catch (err) {
      console.log('TTS 错误:', err);
    }
  };

  const showMessage = (text) => {
    setMessage(text);
    setMessageVisible(true);
    setTimeout(() => setMessageVisible(false), 2000);
  };

  // 打开道具选择框
  const openItemSelect = (action) => {
    // 如果正在睡觉，不能操作
    if (gameState.isSleeping) {
      showMessage('😴 正在睡觉呢，先唤醒我吧～');
      speak('正在睡觉呢');
      return;
    }
    setCurrentAction(action);
    setShowItemSelect(true);
  };

  // 使用道具
  const handleUseItem = (itemKey) => {
    const result = useItem(gameState, itemKey);
    
    if (result.success) {
      setGameState(result.state);
      const item = gameState.shop[itemKey];
      showMessage(`使用 ${item.name} 成功！`);
      speak(`使用${item.name}成功！`);
      
      if (itemKey === 'food' || itemKey === 'superFood') {
        setTimeout(() => {
          const taskResult = completeTask(result.state, 'feed');
          setGameState(taskResult.state);
        }, 100);
      } else if (itemKey === 'toy') {
        setTimeout(() => {
          const taskResult = completeTask(result.state, 'play');
          setGameState(taskResult.state);
        }, 100);
      } else if (itemKey === 'soap' || itemKey === 'shampoo') {
        setTimeout(() => {
          const taskResult = completeTask(result.state, 'clean');
          setGameState(taskResult.state);
        }, 100);
      }
    } else {
      showMessage('没有这个道具了，快去购买吧！');
      speak('道具不足，快去购买吧！');
    }
    
    setShowItemSelect(false);
  };

  // 清洁
  const handleClean = () => {
    if (gameState.isSleeping) {
      showMessage('😴 正在睡觉呢，先唤醒我吧～');
      speak('正在睡觉呢');
      return;
    }
    
    if (gameState.inventory.soap === 0 && gameState.inventory.shampoo === 0) {
      Alert.alert(
        '没有清洁道具',
        '你没有清洁道具了，要去商店购买吗？',
        [
          { text: '取消', style: 'cancel' },
          { text: '去商店', onPress: () => setShowShop(true) }
        ]
      );
      return;
    }
    openItemSelect('clean');
  };

  // 喂食
  const handleFeed = () => {
    if (gameState.isSleeping) {
      showMessage('😴 正在睡觉呢，先唤醒我吧～');
      speak('正在睡觉呢');
      return;
    }
    
    if (gameState.inventory.food === 0 && gameState.inventory.superFood === 0 && gameState.inventory.medicine === 0) {
      Alert.alert(
        '没有道具',
        '你没有可用的道具了，要去商店购买吗？',
        [
          { text: '取消', style: 'cancel' },
          { text: '去商店', onPress: () => setShowShop(true) }
        ]
      );
      return;
    }
    openItemSelect('feed');
  };

  // 玩耍
  const handlePlay = () => {
    if (gameState.isSleeping) {
      showMessage('😴 正在睡觉呢，先唤醒我吧～');
      speak('正在睡觉呢');
      return;
    }
    
    if (gameState.inventory.toy === 0) {
      Alert.alert(
        '没有玩具',
        '你没有玩具道具了，要去商店购买吗？',
        [
          { text: '取消', style: 'cancel' },
          { text: '去商店', onPress: () => setShowShop(true) }
        ]
      );
      return;
    }
    openItemSelect('play');
  };

  // 睡觉
  const handleGoToSleep = () => {
    console.log('点击睡觉按钮，当前精力:', gameState.energy);
    
    if (gameState.energy > 70) {
      showMessage('😊 我还精神着呢，不想睡觉～');
      speak('我还精神着呢');
      return;
    }
    
    // 直接设置睡觉状态
    setGameState(prev => ({
      ...prev,
      isSleeping: true,
    }));
    
    showMessage('😴 晚安啦～');
    speak('晚安啦～');
  };

  // 唤醒 - 修复版
  const handleWakeUp = () => {
    console.log('========== 点击唤醒按钮 ==========');
    console.log('当前gameState.isSleeping:', gameState.isSleeping);
    
    // 直接设置唤醒状态
    setGameState(prev => {
      console.log('唤醒前prev.isSleeping:', prev.isSleeping);
      const newState = {
        ...prev,
        isSleeping: false,
      };
      console.log('唤醒后newState.isSleeping:', newState.isSleeping);
      return newState;
    });
    
    showMessage('🌞 早上好！');
    speak('早上好！');
    
    // 给早起奖励
    setTimeout(() => {
      handleTaskComplete('wakeup');
    }, 500);
  };

  // 重生
  const handleReborn = () => {
    Alert.alert(
      '🔄 重生转世',
      '确定要重生吗？所有属性会重置，但会保留VIP状态和部分金币。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重生',
          onPress: () => {
            setGameState(prev => ({
              ...getInitialGameState(),
              vip: prev.vip,
              coins: Math.max(100, prev.coins),
              inventory: {
                food: 5,
                superFood: 5,
                toy: 5,
                medicine: 5,
                soap: 5,
                shampoo: 3,
              },
            }));
            showMessage('✨ 重生成功！新的旅程开始啦！');
            speak('重生成功！');
          }
        }
      ]
    );
  };

  // 每日签到
  const handleDailyCheckIn = () => {
    const result = dailyCheckIn(gameState);
    
    if (result.success) {
      setGameState(result.state);
      showMessage(result.message);
      speak('签到成功！');
    } else {
      showMessage('今天已经签到过了，明天再来吧！');
      speak('今天已经签到过了');
    }
  };

  // 完成任务得金币
  const handleTaskComplete = (taskType) => {
    const result = completeTask(gameState, taskType);
    
    if (result.success) {
      setGameState(result.state);
      showMessage(result.message);
    }
  };

  // 看广告得金币
  const handleWatchAd = () => {
    Alert.alert(
      '看广告得金币',
      '观看视频广告可获得30金币，确定要看吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '观看',
          onPress: () => {
            const newState = watchAd(gameState);
            setGameState(newState);
            showMessage('感谢观看！获得30金币！');
            speak('获得30金币');
          }
        }
      ]
    );
  };

  // 开通VIP（预留接口）
  const handleBuyVip = () => {
    Alert.alert(
      '开通VIP',
      '👑 VIP特权开发中，敬请期待！',
      [
        { text: '确定', style: 'cancel' }
      ]
    );
  };

  // 退出保存
  const handleExit = () => {
    Alert.alert(
      '退出游戏',
      '确定要退出吗？游戏进度会自动保存。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '退出', 
          onPress: async () => {
            await saveGameData(gameState);
            showMessage('💾 保存成功，再见啦！');
            speak('保存成功，再见啦！');
            setTimeout(() => {
              BackHandler.exitApp();
            }, 1000);
          }
        }
      ]
    );
  };

  const getImageSource = () => {
    const state = getImageState(
      gameState.hunger, 
      gameState.happiness, 
      gameState.cleanliness, 
      gameState.energy, 
      gameState.isSleeping
    );
    
    switch (state) {
      case 'sleep': return require('../../images/cat/sleep.png');
      case 'dirty': return require('../../images/cat/dirty.png');
      case 'happy': return require('../../images/cat/happy.png');
      case 'hungry': return require('../../images/cat/hungry.png');
      case 'sad': return require('../../images/cat/sad.png');
      case 'sick': return require('../../images/cat/sick.png');
      default: return require('../../images/cat/happy.png');
    }
  };

  const icons = {
    feed: require('../../images/icons/food.png'),
    play: require('../../images/icons/play.png'),
    clean: require('../../images/icons/clean.png'),
    sleep: require('../../images/icons/sleep.png'),
    wake: require('../../images/icons/sleep.png'), // 暂时用睡觉图标代替唤醒图标
  };

  return (
    <View style={styles.container}>
      {/* 顶部栏 */}
      <View style={styles.topBar}>
        <View style={styles.coinBar}>
          <Text style={styles.coinIcon}>💰</Text>
          <Text style={styles.coinText}>{gameState.coins}</Text>
        </View>
        
        <View style={styles.topButtons}>
          {/* 第一行按钮 */}
          <View style={styles.topButtonsRow}>
            <TouchableOpacity style={styles.topButton} onPress={() => setShowShop(true)}>
              <Text style={styles.topButtonIcon}>🏪</Text>
              <Text style={styles.topButtonText}>商店</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topButton} onPress={() => setShowInventory(true)}>
              <Text style={styles.topButtonIcon}>🎒</Text>
              <Text style={styles.topButtonText}>背包</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topButton} onPress={handleDailyCheckIn}>
              <Text style={styles.topButtonIcon}>📅</Text>
              <Text style={styles.topButtonText}>签到</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topButton} onPress={handleWatchAd}>
              <Text style={styles.topButtonIcon}>📺</Text>
              <Text style={styles.topButtonText}>广告</Text>
            </TouchableOpacity>
          </View>
          
          {/* 第二行按钮 */}
          <View style={styles.topButtonsRow}>
            <TouchableOpacity style={styles.topButton} onPress={handleReborn}>
              <Text style={styles.topButtonIcon}>🔄</Text>
              <Text style={styles.topButtonText}>重生</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.topButton, { backgroundColor: '#FFD700' }]} onPress={handleBuyVip}>
              <Text style={styles.topButtonIcon}>👑</Text>
              <Text style={styles.topButtonText}>VIP</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.topButton} onPress={handleExit}>
              <Text style={styles.topButtonIcon}>🚪</Text>
              <Text style={styles.topButtonText}>退出</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.rarityBadge, { backgroundColor: RARITY[gameState.rarity].color }]}>
          <Text style={styles.rarityText}>{RARITY[gameState.rarity].name}</Text>
        </View>
      </View>

      {/* 宠物区域 */}
      <View style={styles.petContainer}>
        <PetWithAnimation
          imageSource={getImageSource()}
          isSleeping={gameState.isSleeping}
          happiness={gameState.happiness}
          hunger={gameState.hunger}
        />
        
        {messageVisible && (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
        
        <Text style={styles.stageText}>{getStageName(gameState.stage)}</Text>
        <Text style={styles.expText}>经验值: {gameState.exp}</Text>
        {gameState.isSleeping && <Text style={styles.sleepingText}>😴 睡觉中 Zzz...</Text>}
      </View>

      {/* 状态条 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>🍖</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { 
              width: `${Math.min(100, gameState.hunger)}%`, 
              backgroundColor: '#4CAF50' 
            }]} />
          </View>
          <Text style={styles.statValue}>{Math.floor(gameState.hunger)}%</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>😊</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { 
              width: `${Math.min(100, gameState.happiness)}%`, 
              backgroundColor: '#FF9800' 
            }]} />
          </View>
          <Text style={styles.statValue}>{Math.floor(gameState.happiness)}%</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>✨</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { 
              width: `${Math.min(100, gameState.cleanliness)}%`, 
              backgroundColor: '#2196F3' 
            }]} />
          </View>
          <Text style={styles.statValue}>{Math.floor(gameState.cleanliness)}%</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>⚡</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { 
              width: `${Math.min(100, gameState.energy)}%`, 
              backgroundColor: '#9C27B0' 
            }]} />
          </View>
          <Text style={styles.statValue}>{Math.floor(gameState.energy)}%</Text>
        </View>
      </View>

      {/* 图标按钮区域 - 修复版 */}
      <View style={styles.iconButtonContainer}>
        <AnimatedIconButton
          iconSource={icons.feed}
          text="喂食"
          onPress={handleFeed}
          count={gameState.inventory.food + gameState.inventory.superFood + gameState.inventory.medicine}
        />
        
        <AnimatedIconButton
          iconSource={icons.play}
          text="玩耍"
          onPress={handlePlay}
          count={gameState.inventory.toy}
        />
        
        <AnimatedIconButton
          iconSource={icons.clean}
          text="清洁"
          onPress={handleClean}
          count={gameState.inventory.soap + gameState.inventory.shampoo}
        />
        
        {/* 使用条件渲染，并添加key确保重新渲染 */}
        {!gameState.isSleeping ? (
          <AnimatedIconButton
            key="sleep-button"
            iconSource={icons.sleep}
            text="睡觉"
            onPress={handleGoToSleep}
          />
        ) : (
          <AnimatedIconButton
            key="wake-button"
            iconSource={icons.wake}
            text="唤醒"
            onPress={handleWakeUp}
          />
        )}
      </View>

      {/* 道具选择弹窗 */}
      <ItemSelectModal
        visible={showItemSelect}
        onClose={() => setShowItemSelect(false)}
        onSelectItem={handleUseItem}
        inventory={gameState.inventory}
        shop={gameState.shop}
        actionType={currentAction}
      />

      {/* 商店弹窗 */}
      <Modal visible={showShop} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🏪 商店</Text>
            <Text style={styles.modalCoin}>💰 {gameState.coins} 金币</Text>
            
            <FlatList
              data={Object.entries(gameState.shop)}
              keyExtractor={([key]) => key}
              renderItem={({ item: [key, value] }) => (
                <TouchableOpacity 
                  style={styles.shopItem}
                  onPress={() => {
                    const newState = buyItem(gameState, key);
                    if (newState !== gameState) {
                      setGameState(newState);
                      showMessage(`购买 ${value.name} 成功！`);
                      speak(`购买${value.name}成功！`);
                    } else {
                      showMessage('💰 金币不足！');
                      speak('金币不足！');
                    }
                  }}
                >
                  <View>
                    <Text style={styles.shopItemName}>{value.name}</Text>
                    <Text style={styles.shopItemEffect}>{value.effect}</Text>
                  </View>
                  <Text style={styles.shopItemPrice}>💰 {value.price}</Text>
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowShop(false)}>
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 背包弹窗 */}
      <Modal visible={showInventory} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎒 背包</Text>
            
            <FlatList
              data={Object.entries(gameState.inventory).filter(([_, count]) => count > 0)}
              keyExtractor={([key]) => key}
              renderItem={({ item: [key, count] }) => (
                <View style={styles.inventoryItem}>
                  <View>
                    <Text style={styles.inventoryItemName}>{gameState.shop[key]?.name || key}</Text>
                    <Text style={styles.inventoryItemEffect}>{gameState.shop[key]?.effect || ''}</Text>
                  </View>
                  <View style={styles.inventoryItemRight}>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>x{count}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
            
            {Object.values(gameState.inventory).every(count => count === 0) && (
              <Text style={styles.emptyText}>背包空空如也～</Text>
            )}
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowInventory(false)}>
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    padding: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  coinBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  topButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '60%',
  },
  topButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 2,
  },
  topButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E1',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    marginHorizontal: 2,
    marginVertical: 1,
  },
  topButtonIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  topButtonText: {
    fontSize: 10,
    color: '#FF69B4',
    fontWeight: 'bold',
  },
  rarityBadge: {
    padding: 5,
    borderRadius: 15,
    minWidth: 50,
    alignItems: 'center',
  },
  rarityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },
  petContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  messageBubble: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 15,
    marginTop: 10,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 14,
    color: '#FF69B4',
  },
  stageText: {
    fontSize: 14,
    color: '#FF69B4',
    marginTop: 5,
    fontWeight: 'bold',
  },
  expText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sleepingText: {
    fontSize: 14,
    color: '#9C27B0',
    marginTop: 5,
    fontStyle: 'italic',
  },
  statsContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  statLabel: {
    width: 25,
    fontSize: 14,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#FFE4E1',
    borderRadius: 4,
    marginLeft: 5,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    width: 40,
    fontSize: 10,
    color: '#666',
    marginLeft: 5,
  },
  iconButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 40,
    marginHorizontal: 5,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#FF69B4',
  },
  modalCoin: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    color: '#8B4513',
  },
  shopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
  },
  shopItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  shopItemEffect: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  shopItemPrice: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
  },
  inventoryItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inventoryItemEffect: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inventoryItemRight: {
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#FF69B4',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#FF69B4',
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MainScreen;