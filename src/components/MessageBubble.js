import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ message, visible, isSleeping }) {
  if (!visible && !isSleeping) return null;

  return (
    <>
      {isSleeping && (
        <Text style={styles.sleepingText}>💤 正在睡觉 zZ Z...</Text>
      )}
      {visible && (
        <View style={styles.messageBubble}>
          <View style={styles.messageTail} />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sleepingText: {
    fontSize: 14,
    color: '#9C27B0',
    textAlign: 'center',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  messageBubble: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 25,
    marginBottom: 15,
    alignSelf: 'center',
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  messageTail: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
  messageText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#FF69B4',
    fontWeight: '500',
  },
});