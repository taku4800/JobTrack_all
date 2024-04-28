// デモ用です.
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const alarmSound = require('./assets/alarm.mp3'); // アラーム音声ファイル.

  // アラームのセット、再生、停止のフラグ設定.
  const [sound, setSound] = useState(null);
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
  const [isAlarmStopped, setIsAlarmStopped] = useState(false);

  // アラーム再生の設定.
  if (!isAlarmTriggered) {
    setTimeout(() => {
      playSound();
      setIsAlarmTriggered(true);
    }, 10000);
  }
  
  // 音声の再生.
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(alarmSound, { shouldPlay: true });
    setSound(sound);
  };

  // 音声の停止.
  const stopSound = async () => {
    if (sound && !isAlarmStopped) {
      await sound.unloadAsync();
      setIsAlarmStopped(true);
    }
  };

  // デザイン.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>目覚ましアプリ</Text>
      {isAlarmTriggered && !isAlarmStopped && <Button title="降りろ！" onPress={stopSound} />}
    </View>
  );
}