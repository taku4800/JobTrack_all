import React, { useEffect, useState } from "react"; // React、useEffectフック、useStateフックをインポート
import { Clipboard, View, Text, StyleSheet } from "react-native"; // Clipboard、View、Textをreact-nativeからインポート

const StationInfo = ({ text }) => {
  // テキストを行ごとに分割
  const lines = text.split("\n");
  // 駅名と時間のリストを初期化
  const stationsAndTimes = [];
  // 各行のテキストを処理
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // テキストが駅名かどうかを判定
    if (line.startsWith("■")) {
      const station = line.substring(1); // 駅名を取得
      let time = "stop"; // 時間の初期値を設定(到着駅のときは時間が載ってないので、{"駅:自由が丘",時間:"stop"}みたいになる)

      // 次の行が時間であれば取得
      if (lines[i + 1].startsWith("↓")) {
        time = lines[i + 1].substring(8); // 停車する時間を取得
        i++; // 次の行は時間なのでインデックスを進める
      }

      // 駅名と時間をリストに追加 [1,1]にプッシュすると[1,1,1]になるみたいな
      stationsAndTimes.push({ station, time });
      //mapは配列のためのfor文のようなもの？、勝手に全部の中身に動作させてくれる
      //stationsAndTimes.map((item, index) => {
      //   console.log("【" + item.station + "】のindexは" + index + "です");
      //});
    }
  }

  //console.log(stationsAndTimes[0]["station"]);
  //console.log("time");
  //console.log(stationsAndTimes);
  //こんな感じで到着時間が取り出せる
  for (let i = 0; i < stationsAndTimes.length; i++) {
    console.log("着", stationsAndTimes[i]["time"]);
  }

  return (
    <View>
      {stationsAndTimes.map((item, index) => (
        <View key={index}>
          <Text>{item.station}</Text>
          <Text>{item.time}</Text>
        </View>
      ))}
    </View>
  );
};

export default function App() {
  // ステートとしてクリップボードのテキストを保持する
  const [clipboardContent, setClipboardContent] = useState("");

  // useEffectフックを使用して、コンポーネントがマウントされたときにクリップボードのテキストを取得する処理を実行する
  useEffect(() => {
    // fetchClipboardText関数の定義
    const fetchClipboardText = async () => {
      try {
        // クリップボードからテキストを取得し、clipboardContentにセット
        const clipboardText = await Clipboard.getString();
        setClipboardContent(clipboardText); // ステートにセット
        // 取得したテキストをコンソールに出力
        //console.log('クリップボードの内容:', clipboardText);
      } catch (error) {
        // エラーが発生した場合は、エラーメッセージをコンソールに出力
        console.error(
          "クリップボードからテキストを取得できませんでした:",
          error
        );
      }
    };

    // fetchClipboardText関数を実行
    fetchClipboardText();
  }, []); // useEffectの依存リストに空の配列を指定しているので、マウント時のみ実行される

  // テキストを表示するViewコンポーネントを返す
  return (
    <View style={styles.container}>
      {/* StationInfoコンポーネントにクリップボードのテキストを渡して表示 */}
      <StationInfo text={clipboardContent} />
      {/* クリップボードの内容を表示するテキスト */}
      <Text style={styles.text}>
        クリップボードの内容はコンソールに表示されます。
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});