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

export default function ActionChoiceModal({
  visible,
  onClose,
  items,          // 所有道具库存
  actionType,     // 'feed', 'play', 'clean'
  onUseItem,      // 使用道具的回调
  onNormalAction, // 执行普通动作的回调
}) {
  // 过滤出当前动作可用的道具（库存>0且type匹配）
  const availableItems = Object.entries(items)
    .filter(([id, qty]) => qty > 0 && ITEMS[id]?.type === actionType)
    .map(([id, qty]) => ({ id, qty, ...ITEMS[id] }));

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => {
        onUseItem(item.id);
        onClose();
      }}>
      <Text style={styles.itemEmoji}>{item.emoji}</Text>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>
      </View>
      <Text style={styles.itemQty}>x{item.qty}</Text>
    </TouchableOpacity>
  );

  const getActionName = () => {
    switch (actionType) {
      case 'feed': return '喂食';
      case 'play': return '玩耍';
      case 'clean': return '清洁';
      default: return '动作';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>选择{getActionName()}方式</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {availableItems.length > 0 ? (
            <>
              <Text style={styles.subtitle}>可用道具：</Text>
              <FlatList
                data={availableItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
              />
            </>
          ) : (
            <Text style={styles.emptyText}>没有可用的道具，将使用普通{getActionName()}</Text>
          )}

          <TouchableOpacity
            style={styles.normalButton}
            onPress={() => {
              onNormalAction();
              onClose();
            }}>
            <Text style={styles.normalButtonText}>普通{getActionName()}</Text>
          </TouchableOpacity>
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
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
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
    color: '#FF69B4',
    marginRight: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
  normalButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  normalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});