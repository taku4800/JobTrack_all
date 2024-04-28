import React, { useState, useEffect } from 'react';
import { View, Image, Clipboard, Text, Button, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';



export default function App() {
  const alarmSound = require("./assets/alarm.mp3"); // アラーム音声ファイル.

  // アラームのセット、再生、停止のフラグ設定.
  const [sound, setSound] = useState(null);
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);
  const [isAlarmStopped, setIsAlarmStopped] = useState(false);
  const [stationsAndTimes, setStationsAndTimes] = useState([]); // stationsAndTimesのステートを追加
  const [alarmSetupCount, setAlarmSetupCount] = useState(0); // アラーム設定回数を記録
  const [latestPhoto, setLatestPhoto] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false); // 新しい状態(isFullScreen)を追加

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

  useEffect(() => {
    // テキストから駅名と時間のリストを作成する関数
    const parseText = (text) => {
      const lines = text.split("\n");
      const stationsAndTimes = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("■")) {
          const station = line.substring(1);
          let time = "stop";
          if (lines[i + 1].startsWith("↓")) {
            time = lines[i + 1].substring(8);
          }
          stationsAndTimes.push({ station, time });
        } else if (line.startsWith("▼")) {
          time = lines[i + 1].substring(8);
          console.log("乗り換え");
          console.log(
            (stationsAndTimes[stationsAndTimes.length - 1]["time"] = time)
          );
        }
      }
      console.log("time配列長さは", stationsAndTimes.length);
      return stationsAndTimes;
    };

    // クリップボードからテキストを取得し、駅名と時間のリストをセットする関数
    const fetchClipboardText = async () => {
      try {
        const clipboardText = await Clipboard.getString();
        const parsedData = parseText(clipboardText);
        setStationsAndTimes(parsedData);
        setupAlarm();
      } catch (error) {
        console.error(
          "クリップボードからテキストを取得できませんでした:",
          error
        );
      }
    };

    // マウント時にクリップボードからテキストを取得し、駅名と時間のリストをセット
    fetchClipboardText();
  }, []); // useEffectの依存リストに空の配列を指定しているので、マウント時のみ実行される

  // アラーム再生の設定.
  //試行回数の足し方がよくわからないので改善の余地あり。
  //ボタンのstationsAndTimes[alarmSetupCount]"time"]のせいでalarmSetupCountを余分に足しちゃいけない
  setupAlarm = () => {
    if (stationsAndTimes.length - 1 > alarmSetupCount) {
      const nextAlarmTime = stationsAndTimes[alarmSetupCount]["time"]; // 次のアラームの時間を取得
      console.log(
        "本当に読み取った時間",
        stationsAndTimes[alarmSetupCount]["time"]
      );
      const nextAlarmTimeDate = new Date(); //一回、時間テンプレートを読み込んで時間と分だけ変える
      // const nextAlarmTime = [
      //  `${String(nextAlarmTimeDate.getHours()).padStart(2, "0")}:${String(
      //    nextAlarmTimeDate.getMinutes() + 1
      //  ).padStart(2, "0")}`,
      //  "03:30",
      //  "03:31",
      //  "03:32",
      //  "03:32",
      //  "03:32",
      //]; //デモ用のために時間1分後に無理やりセット-----------------------------------------------------------
      console.log("iは", alarmSetupCount);
      console.log("次に鳴るのは", nextAlarmTime);
      // nextAlarmTime を現在の日付にマージし、Date オブジェクトを生成

      //console.log("今の時間", nextAlarmTimeDate.getMinutes());
      const [hours, minutes] = nextAlarmTime.split(":");
      //if (i < nextAlarmTime.length) {
      //  i++;
      //}

      nextAlarmTimeDate.setHours(Number(hours));
      nextAlarmTimeDate.setMinutes(Number(minutes));
      nextAlarmTimeDate.setSeconds(0);

      const currentTime = new Date(); // 現在時刻を取得
      const timeDifference = nextAlarmTimeDate - currentTime;

      console.log(timeDifference / 1000 - 10, "秒後に鳴る"); //余裕を持って10秒前に鳴らす
      //console.log("今は", Date());

      // 次のアラームの時間まで待機してアラームを再生
      setTimeout(() => {
        playSound();
        setIsAlarmTriggered(true);
      }, timeDifference - 60 * 1000);
    }
  };

  // 音声の再生.
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(alarmSound, {
      shouldPlay: true,
    });
    console.log("音鳴らす");
    setSound(sound);
  };

  // 音声の停止.
  const stopSound = async () => {
    if (sound && !isAlarmStopped) {
      await sound.unloadAsync();
      setIsAlarmStopped(false);
      setIsAlarmTriggered(false);
      console.log("音止めた");
      setAlarmSetupCount(alarmSetupCount + 1); // アラーム設定回数をインクリメント
      console.log("アラーム何回目?", alarmSetupCount);
      setupAlarm();
    }
  };

  // デザイン.
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.textContainer}>
        {stationsAndTimes.length > 0 && (
          <Text style={styles.text}>{stationsAndTimes[alarmSetupCount]["time"]}</Text>
        )}
        {isAlarmTriggered && !isAlarmStopped && (
          <TouchableOpacity onPress={stopSound} style={styles.button}>
            <Text style={styles.buttonText} onPress={stopSound}>降りろ！</Text>
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
    zIndex: 2,
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
    zIndex: 1,
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

