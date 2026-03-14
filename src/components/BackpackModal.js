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

export default function BackpackModal({
  visible,
  onClose,
  items,
  onUseItem,
}) {
  // 过滤出数量大于0的道具
  const inventoryList = Object.entries(items)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => ({ id, qty, ...ITEMS[id] }));

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemEmoji}>{item.emoji}</Text>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>
      </View>
      <Text style={styles.itemQty}>x{item.qty}</Text>
      <TouchableOpacity
        style={styles.useButton}
        onPress={() => onUseItem(item.id)}>
        <Text style={styles.useText}>使用</Text>
      </TouchableOpacity>
    </View>
  );

  const emptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>背包空空如也，快去商店买点东西吧～</Text>
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
            <Text style={styles.title}>我的背包</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={inventoryList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={emptyComponent}
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
    color: '#8B4513',
  },
  close: {
    fontSize: 24,
    color: '#999',
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
  itemQty: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginRight: 15,
  },
  useButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  useText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});