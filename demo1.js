import React, { useState, useEffect } from 'react';
import { View, Image, Text, Button, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

export default function App() {

  const [latestPhoto, setLatestPhoto] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false); // 新しい状態(isFullScreen)を追加
  const [alarmTime, setAlarmTime] = useState("17:10"); // アラーム時刻の状態を追加


  useEffect(() => {
    (async () => {
      await MediaLibrary.requestPermissionsAsync();
      const assets = await MediaLibrary.getAssetsAsync({ sortBy: MediaLibrary.SortBy.creationTime });
      if (assets?.assets.length > 0) {
        setLatestPhoto(assets.assets[0].uri);
      }
    })();
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen); // 全画面表示の状態をトグルする
  };

  const alarmSound = require('./assets/alarm.mp3'); // アラーム音声ファイル.

  // アラームのセット、再生、停止のフラグ設定.
  const [sound, setSound] = useState(null);
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
  const [isCount, setIsCount] = useState(true);

  // アラーム再生の設定.
  if (isCount) {
    setIsCount(false);
    setTimeout(() => {
      playSound();
      setIsAlarmTriggered(true);
    }, 1000);
  }
  
  // 音声の再生.
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(alarmSound, { shouldPlay: true });
    setSound(sound);
  };

  // 音声の停止.
  const stopSound = async () => {
    if (sound && isAlarmTriggered) {
      await sound.unloadAsync();
      setIsAlarmTriggered(false);
      setAlarmTime("17:20");
    }
  };

  // デザイン.
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.textContainer}>
      <Text style={styles.text}>{alarmTime}</Text>
        {isAlarmTriggered && (
          <TouchableOpacity onPress={stopSound} style={styles.button}>
            <Text style={styles.buttonText}>降りろ！</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* 画像が小さく表示されている場合 */}
      {!isFullScreen && (
        <TouchableOpacity onPress={toggleFullScreen} style={styles.thumbnailContainer}>
          <Image source={{ uri: latestPhoto }} style={styles.thumbnail} />
        </TouchableOpacity>
      )}
      
      {/* 画像が全画面表示されている場合 */}
      {isFullScreen && (
        <TouchableOpacity onPress={toggleFullScreen} style={styles.fullScreenContainer}>
          <Image source={{ uri: latestPhoto }} style={styles.fullScreenImage} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  thumbnail: {
    zIndex: 2,
    width: 74,
    height: 160,
    borderRadius: 10,
  },
  fullScreenContainer: {
    flex: 1,
    zIndex:2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    resizeMode: 'contain',
  },
  textContainer: {
    zIndex:1,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',

  },
  text: {
    fontSize: 130,
  },
  button: {
    marginTop: 20,
    width: 200, // ボタンの幅
    height: 50, // ボタンの高さ
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

