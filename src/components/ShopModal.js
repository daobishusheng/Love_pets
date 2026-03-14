import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { ITEMS } from '../config/items';

export default function ShopModal({
  visible,
  onClose,
  coins,
  items,
  onBuy,
  onUseItem,
}) {
  // 渲染拥有的道具
  const renderInventory = () => {
    const inventoryList = Object.entries(items).filter(([_, qty]) => qty > 0);
    if (inventoryList.length === 0) return null;
    return (
      <View style={styles.inventory}>
        <Text style={styles.inventoryTitle}>我的道具</Text>
        <View style={styles.inventoryItems}>
          {inventoryList.map(([id, qty]) => (
            <View key={id} style={styles.inventoryItem}>
              <Text style={styles.inventoryEmoji}>{ITEMS[id].emoji}</Text>
              <Text style={styles.inventoryQty}>x{qty}</Text>
              <TouchableOpacity
                style={styles.useButton}
                onPress={() => onUseItem(id)}>
                <Text style={styles.useText}>使用</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemEmoji}>{item.emoji}</Text>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>
      </View>
      <View style={styles.itemPrice}>
        <Text style={styles.priceIcon}>💰</Text>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
      <TouchableOpacity
        style={[styles.buyButton, coins < item.price && styles.disabled]}
        onPress={() => onBuy(item)}
        disabled={coins < item.price}>
        <Text style={styles.buyText}>购买</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>商店</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          {renderInventory()}
          <FlatList
            data={Object.values(ITEMS)}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  close: {
    fontSize: 24,
    color: '#999',
  },
  inventory: {
    backgroundColor: '#E6E6FA',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  inventoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9370DB',
    marginBottom: 5,
  },
  inventoryItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 5,
  },
  inventoryEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  inventoryQty: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  useButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  useText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
  },
  itemEmoji: {
    fontSize: 30,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  priceIcon: {
    fontSize: 16,
    marginRight: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  buyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buyText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: '#A0A0A0',
    opacity: 0.5,
  },
});