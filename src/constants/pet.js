// 只保留猫
export const BREEDS = {
  cat: { name: '小喵喵', sound: '喵～', emoji: '🐱' },
};

// 品质配置
export const RARITY = {
  1: { name: '普通', color: '#A0A0A0', multiplier: 1.0 },
  2: { name: '稀有', color: '#4169E1', multiplier: 1.2 },
  3: { name: '史诗', color: '#9B30FF', multiplier: 1.5 },
  4: { name: '传说', color: '#FFD700', multiplier: 2.0 },
};

// 阶段名称
export const getStageName = (stage) => {
  switch (stage) {
    case 'baby': return '小宝宝';
    case 'child': return '小朋友';
    case 'teen': return '小少年';
    case 'adult': return '大朋友';
    default: return '未知';
  }
};

// 进化逻辑
export const getNextStage = (currentStage, exp, rarityMultiplier) => {
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

// 根据状态获取图片名称
export const getImageState = (hunger, happiness, cleanliness, energy, isSleeping) => {
  if (isSleeping) return 'sleep';
  if (hunger < 30) return 'hungry';
  if (happiness < 30) return 'sad';
  if (cleanliness < 30) return 'dirty';
  if (energy < 30) return 'sick';
  return 'happy';
};