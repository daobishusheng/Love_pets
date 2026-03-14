import { useState } from 'react';

export default function useInventory() {
  const [coins, setCoins] = useState(100);
  const [items, setItems] = useState({
    food: 0,
    toy: 0,
    medicine: 0,
  });

  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
  };

  const spendCoins = (amount) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true;
    }
    return false;
  };

  const addItem = (itemId, quantity = 1) => {
    setItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + quantity,
    }));
  };

  const useItem = (itemId) => {
    if (items[itemId] > 0) {
      setItems(prev => ({
        ...prev,
        [itemId]: prev[itemId] - 1,
      }));
      return true;
    }
    return false;
  };

  const setInventory = (newCoins, newItems) => {
    setCoins(newCoins);
    setItems(newItems);
  };

  return {
    coins,
    items,
    addCoins,
    spendCoins,
    addItem,
    useItem,
    setInventory,
  };
}