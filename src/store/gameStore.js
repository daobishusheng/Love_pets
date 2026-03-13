// 初始化游戏数据
export const getInitialGameState = () => ({
  petBreed: 'cat',
  stage: 'baby',
  rarity: 1,
  exp: 0,
  hunger: 80,
  happiness: 80,
  cleanliness: 80,
  energy: 80,
  isSleeping: false,
  coins: 100,
  vip: false,
  lastCheckIn: null,
  totalPlayTime: 0,
  inventory: {
    food: 5,
    superFood: 5,
    toy: 5,
    medicine: 5,
    soap: 5,
    shampoo: 3,
  },
  shop: {
    food: { price: 10, name: '🍖 普通食物', effect: '饱食度+20', hunger: 20, happiness: 0, energy: 0, cleanliness: 0 },
    superFood: { price: 30, name: '🥩 高级食物', effect: '饱食度+30 快乐度+10', hunger: 30, happiness: 10, energy: 0, cleanliness: 0 },
    toy: { price: 25, name: '🧸 玩具', effect: '快乐度+20', hunger: 0, happiness: 20, energy: 0, cleanliness: 0 },
    medicine: { price: 20, name: '💊 药品', effect: '精力+30', hunger: 0, happiness: 0, energy: 30, cleanliness: 0 },
    soap: { price: 15, name: '🧼 肥皂', effect: '清洁度+20', hunger: 0, happiness: 0, energy: 0, cleanliness: 20 },
    shampoo: { price: 35, name: '🧴 沐浴露', effect: '清洁度+30 快乐度+5', hunger: 0, happiness: 5, energy: 0, cleanliness: 30 },
  },
});

// 购买道具
export const buyItem = (state, itemKey) => {
  const item = state.shop[itemKey];
  if (!item) return state;
  
  const price = state.vip ? Math.floor(item.price * 0.8) : item.price;
  
  if (state.coins >= price) {
    const newState = {
      ...state,
      coins: state.coins - price,
      inventory: {
        ...state.inventory,
        [itemKey]: (state.inventory[itemKey] || 0) + 1,
      },
    };
    console.log('购买后新状态:', newState); // 调试用
    return newState;
  }
  return state;
};

// 使用道具 - 修复版
export const useItem = (state, itemKey) => {
  if (!state.inventory[itemKey] || state.inventory[itemKey] <= 0) {
    return { success: false, state };
  }
  
  const item = state.shop[itemKey];
  if (!item) return { success: false, state };
  
  // 1. 先减少道具数量
  const newInventory = {
    ...state.inventory,
    [itemKey]: state.inventory[itemKey] - 1,
  };
  
  // 2. 计算新的属性值
  let newHunger = state.hunger;
  let newHappiness = state.happiness;
  let newEnergy = state.energy;
  let newCleanliness = state.cleanliness;
  
  if (item.hunger) {
    newHunger = state.hunger + item.hunger;
  }
  if (item.happiness) {
    newHappiness = state.happiness + item.happiness;
  }
  if (item.energy) {
    newEnergy = state.energy + item.energy;
  }
  if (item.cleanliness) {
    newCleanliness = state.cleanliness + item.cleanliness;
  }
  
  // 3. 创建完整的新状态
  const newState = {
    ...state,
    inventory: newInventory,
    hunger: newHunger,
    happiness: newHappiness,
    energy: newEnergy,
    cleanliness: newCleanliness,
    exp: state.exp + 5,
  };
  
  console.log('使用道具后新状态:', newState); // 调试用
  return { success: true, state: newState };
};

// 每日签到
export const dailyCheckIn = (state) => {
  const today = new Date().toDateString();
  
  if (state.lastCheckIn === today) {
    return { success: false, state, message: '今天已经签到过了' };
  }
  
  let reward = 50;
  if (state.lastCheckIn) {
    const lastDate = new Date(state.lastCheckIn);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate.toDateString() === yesterday.toDateString()) {
      reward = 80;
    }
  }
  
  if (state.vip) {
    reward *= 2;
  }
  
  const newState = {
    ...state,
    coins: state.coins + reward,
    lastCheckIn: today,
  };
  
  return {
    success: true,
    state: newState,
    message: `签到成功！获得 ${reward} 金币${state.vip ? '（VIP双倍）' : ''}`,
  };
};

// 完成任务
export const completeTask = (state, taskType) => {
  let reward = 0;
  let taskName = '';
  
  switch(taskType) {
    case 'feed':
      reward = 5;
      taskName = '喂食';
      break;
    case 'play':
      reward = 8;
      taskName = '玩耍';
      break;
    case 'clean':
      reward = 3;
      taskName = '清洁';
      break;
    case 'wakeup':
      reward = 10;
      taskName = '早起';
      break;
    default:
      return { success: false, state };
  }
  
  if (state.vip) {
    reward = Math.floor(reward * 1.5);
  }
  
  const newState = {
    ...state,
    coins: state.coins + reward,
  };
  
  return {
    success: true,
    state: newState,
    message: `完成任务：${taskName}，获得 ${reward} 金币${state.vip ? '（VIP加成）' : ''}`,
  };
};

// 睡觉赚金币
export const sleepEarn = (state, minutes) => {
  if (!state.isSleeping) return state;
  
  let earnPerMinute = 1;
  if (state.vip) {
    earnPerMinute = 2;
  }
  
  const totalEarn = earnPerMinute * minutes;
  
  return {
    ...state,
    coins: state.coins + totalEarn,
  };
};

// 看广告得金币
export const watchAd = (state) => {
  let reward = 30;
  if (state.vip) {
    reward = 50;
  }
  
  return {
    ...state,
    coins: state.coins + reward,
  };
};

// 开通VIP（预留）
export const buyVip = (state) => {
  const vipPrice = 1000;
  
  if (state.coins >= vipPrice) {
    return {
      ...state,
      coins: state.coins - vipPrice,
      vip: true,
    };
  }
  return state;
};