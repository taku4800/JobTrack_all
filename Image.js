import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export default function LatestPhoto() {
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

  return (
    <View style={{ flex: 1 }}>
      {/* 画像が小さく表示されている場合 */}
      {!isFullScreen && (
        <TouchableOpacity onPress={toggleFullScreen} style={styles.container}>
          <Image source={{ uri: latestPhoto }} style={styles.thumbnail} />
        </TouchableOpacity>
      )}
      
      {/* 画像が全画面表示されている場合 */}
      {isFullScreen && (
        <TouchableOpacity onPress={toggleFullScreen} style={styles.fullScreenContainer}>
          <Image source={{ uri: latestPhoto }} style={styles.fullScreenImage} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    resizeMode: 'contain',
  },
});