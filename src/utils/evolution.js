import { RARITY } from '../config/rarity';

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

export const getStageName = (stage) => {
  switch (stage) {
    case 'baby': return '小宝宝';
    case 'child': return '小朋友';
    case 'teen': return '小少年';
    case 'adult': return '大朋友';
    default: return '未知';
  }
};