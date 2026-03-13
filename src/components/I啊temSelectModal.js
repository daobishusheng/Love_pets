import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';

const ItemSelectModal = ({
  visible,
  onClose,
  onSelectItem,
  inventory,
  shop,
  actionType,
}) => {
  // 根据动作类型获取可用的道具
  const getAvailableItems = () => {
    const items = [];
    
    // 喂食可用道具
    if (actionType === 'feed') {
      if (inventory.food > 0) {
        items.push({
          key: 'food',
          ...shop.food,
          count: inventory.food,
          icon: '🍖',
        });
      }
      if (inventory.superFood > 0) {
        items.push({
          key: 'superFood',
          ...shop.superFood,
          count: inventory.superFood,
          icon: '🥩',
        });
      }
      if (inventory.medicine > 0) {
        items.push({
          key: 'medicine',
          ...shop.medicine,
          count: inventory.medicine,
          icon: '💊',
        });
      }
    }
    
    // 玩耍可用道具
    if (actionType === 'play') {
      if (inventory.toy > 0) {
        items.push({
          key: 'toy',
          ...shop.toy,
          count: inventory.toy,
          icon: '🧸',
        });
      }
    }
    
    // 清洁可用道具
    if (actionType === 'clean') {
      console.log('清洁道具检查:', inventory.soap, inventory.shampoo); // 调试日志
      if (inventory.soap > 0) {
        items.push({
          key: 'soap',
          ...shop.soap,
          count: inventory.soap,
          icon: '🧼',
        });
      }
      if (inventory.shampoo > 0) {
        items.push({
          key: 'shampoo',
          ...shop.shampoo,
          count: inventory.shampoo,
          icon: '🧴',
        });
      }
    }
    
    console.log('可用道具:', items); // 调试日志
    return items;
  };

  const items = getAvailableItems();

  // 跳转到商店
  const goToShop = () => {
    onClose();
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.openShop) {
        window.openShop();
      }
    }, 100);
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {actionType === 'feed' && '🍖 选择食物或药品'}
            {actionType === 'play' && '🎾 选择玩具'}
            {actionType === 'clean' && '🧼 选择清洁用品'}
          </Text>

          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>没有可用的道具</Text>
              <TouchableOpacity 
                style={styles.shopButton}
                onPress={goToShop}
              >
                <Text style={styles.shopButtonText}>🛒 快去商店购买</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemButton}
                  onPress={() => onSelectItem(item.key)}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemIcon}>{item.icon}</Text>
                    <View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemEffect}>{item.effect}</Text>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>x{item.count}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#FF69B4',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 15,
  },
  shopButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 10,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E1',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  itemEffect: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemRight: {
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
  cancelButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#FFE4E1',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FF69B4',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ItemSelectModal;