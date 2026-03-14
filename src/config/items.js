export const ITEMS = {
  food: {
    id: 'food',
    name: '高级饲料',
    price: 20,
    emoji: '🥩',
    description: '恢复 20 饱食度，并增加 5 快乐',
    effect: { hunger: 20, happiness: 5, exp: 5 },
    type: 'feed',
  },
  toy: {
    id: 'toy',
    name: '逗猫棒',
    price: 15,
    emoji: '🎣',
    description: '增加 20 快乐，并恢复 5 精力',
    effect: { happiness: 20, energy: 5, exp: 5 },
    type: 'play',
  },
  medicine: {
    id: 'medicine',
    name: '小药丸',
    price: 30,
    emoji: '💊',
    description: '恢复 30 精力，并清除生病状态',
    effect: { energy: 30 },
    type: 'clean',
  },
  // 新增香皂
  soap: {
    id: 'soap',
    name: '香皂',
    price: 18,
    emoji: '🧼',
    description: '增加 25 清洁度，并恢复 5 精力',
    effect: { cleanliness: 25, energy: 5, exp: 3 },
    type: 'clean',
  },
  // 新增沐浴露
  shower_gel: {
    id: 'shower_gel',
    name: '沐浴露',
    price: 25,
    emoji: '🧴',
    description: '增加 30 清洁度，并提升 5 快乐',
    effect: { cleanliness: 30, happiness: 5, exp: 5 },
    type: 'clean',
  },
};