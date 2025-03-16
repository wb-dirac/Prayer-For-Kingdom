import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator';
import { usePrayer } from '../contexts/PrayerContext';
import { formatTime, formatDuration } from '../utils/timeUtils';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { activePrayer, startPrayer, endPrayer, prayers } = usePrayer();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // 处理计时器
  useEffect(() => {
    if (activePrayer) {
      // 启动计时器
      const interval = setInterval(() => {
        const elapsed = Date.now() - activePrayer.startTime;
        setElapsedTime(elapsed);
      }, 1000);
      
      setTimer(interval);
      
      // 清理计时器
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      // 如果没有活动的祷告，清除计时器
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      setElapsedTime(0);
    }
  }, [activePrayer]);

  // 开始新的祷告
  const handleStartNewPrayer = () => {
    navigation.navigate('NewPrayer');
  };

  // 结束当前祷告
  const handleEndPrayer = () => {
    if (activePrayer) {
      Alert.alert(
        '结束祷告',
        '您确定要结束当前祷告吗？',
        [
          {
            text: '取消',
            style: 'cancel'
          },
          {
            text: '确定',
            onPress: () => endPrayer()
          }
        ]
      );
    }
  };

  // 查看祷告详情
  const handleViewPrayerDetail = (prayerId: number) => {
    navigation.navigate('PrayerDetail', { prayerId });
  };

  // 查看全部历史记录
  const handleViewAllHistory = () => {
    navigation.navigate('History');
  };

  // 获取最近的祷告记录（最多5条）
  const recentPrayers = prayers
    .filter(prayer => prayer.endTime) // 只显示已完成的祷告
    .slice(0, 5);

  return (
    <View style={styles.container}>
      {/* 活动祷告区域 */}
      <View style={styles.activeContainer}>
        {activePrayer ? (
          <View style={styles.activePrayer}>
            <Text style={styles.activeTitle}>{activePrayer.title}</Text>
            <Text style={styles.activeType}>{activePrayer.type}</Text>
            <Text style={styles.activeTime}>
              开始时间: {formatTime(new Date(activePrayer.startTime))}
            </Text>
            <Text style={styles.activeDuration}>
              已祷告: {formatDuration(elapsedTime)}
            </Text>
            <TouchableOpacity 
              style={styles.endButton} 
              onPress={handleEndPrayer}
            >
              <Text style={styles.endButtonText}>结束祷告</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noActive}>
            <Text style={styles.noActiveText}>当前没有进行中的祷告</Text>
            <TouchableOpacity 
              style={styles.startButton} 
              onPress={handleStartNewPrayer}
            >
              <Text style={styles.startButtonText}>开始新的祷告</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 最近祷告记录 */}
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>最近祷告</Text>
          <TouchableOpacity onPress={handleViewAllHistory}>
            <Text style={styles.viewAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.recentList}>
          {recentPrayers.length > 0 ? (
            recentPrayers.map(prayer => (
              <TouchableOpacity
                key={prayer.id}
                style={styles.recentItem}
                onPress={() => handleViewPrayerDetail(prayer.id)}
              >
                <View style={styles.recentItemContent}>
                  <Text style={styles.recentItemTitle}>{prayer.title}</Text>
                  <Text style={styles.recentItemType}>{prayer.type}</Text>
                  <Text style={styles.recentItemTime}>
                    {formatTime(new Date(prayer.startTime))}
                  </Text>
                  {prayer.duration && (
                    <Text style={styles.recentItemDuration}>
                      持续时间: {formatDuration(prayer.duration)}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6200ee" />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noRecentText}>暂无祷告记录</Text>
          )}
        </ScrollView>
      </View>

      {/* 悬浮按钮 */}
      {!activePrayer && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleStartNewPrayer}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  activeContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    padding: 16,
  },
  activePrayer: {
    alignItems: 'center',
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  activeType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  activeTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  activeDuration: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 24,
  },
  endButton: {
    backgroundColor: '#ff5252',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  endButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noActive: {
    alignItems: 'center',
    padding: 24,
  },
  noActiveText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recentContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    padding: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#6200ee',
    fontSize: 14,
  },
  recentList: {
    flex: 1,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recentItemType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recentItemTime: {
    fontSize: 12,
    color: '#999',
  },
  recentItemDuration: {
    fontSize: 12,
    color: '#6200ee',
    marginTop: 4,
  },
  noRecentText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 24,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#6200ee',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen; 