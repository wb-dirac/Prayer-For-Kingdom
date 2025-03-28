import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePrayer } from '../contexts/PrayerContext';
import { Prayer } from '../types';
import { formatTime, formatDuration, formatDate } from '../utils/timeUtils';

type PrayerDetailScreenRouteProp = RouteProp<RootStackParamList, 'PrayerDetail'>;
type PrayerDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrayerDetail'>;

const PrayerDetailScreen = () => {
  const route = useRoute<PrayerDetailScreenRouteProp>();
  const navigation = useNavigation<PrayerDetailScreenNavigationProp>();
  const { prayers, deletePrayer } = usePrayer();
  const [prayer, setPrayer] = useState<Prayer | null>(null);
  
  const { prayerId } = route.params;

  // 加载祷告详情
  useEffect(() => {
    const foundPrayer = prayers.find(p => p.id === prayerId);
    if (foundPrayer) {
      setPrayer(foundPrayer);
    } else {
      Alert.alert('错误', '找不到祷告记录');
      navigation.goBack();
    }
  }, [prayerId, prayers]);

  // 处理删除祷告
  const handleDeletePrayer = () => {
    Alert.alert(
      '删除祷告',
      '您确定要删除这条祷告记录吗？此操作不可撤销。',
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePrayer(prayerId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('错误', '删除祷告失败');
              console.error('删除祷告失败:', error);
            }
          }
        }
      ]
    );
  };

  if (!prayer) {
    return (
      <View style={styles.loadingContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* 祷告标题 */}
          <View style={styles.header}>
            <Text style={styles.title}>{prayer.title}</Text>
            <View style={styles.typeContainer}>
              <Text style={styles.type}>{prayer.type}</Text>
            </View>
          </View>

          {/* 祷告时间信息 */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>开始时间</Text>
                <Text style={styles.infoValue}>{formatTime(new Date(prayer.startTime))}</Text>
              </View>
              {prayer.endTime && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>结束时间</Text>
                  <Text style={styles.infoValue}>{formatTime(new Date(prayer.endTime))}</Text>
                </View>
              )}
            </View>
            {prayer.duration && (
              <View style={styles.durationContainer}>
                <Text style={styles.durationLabel}>祷告时长</Text>
                <Text style={styles.durationValue}>{formatDuration(prayer.duration)}</Text>
              </View>
            )}
          </View>

          {/* 祷告备注 */}
          {prayer.notes && (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>备注</Text>
              <Text style={styles.notesContent}>{prayer.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部操作按钮 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePrayer}
        >
          <Ionicons name="trash-outline" size={20} color="#ff5252" />
          <Text style={styles.deleteButtonText}>删除祷告</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  typeContainer: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  type: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  durationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  durationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 20,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  notesCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  notesContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ff5252',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#ff5252',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PrayerDetailScreen; 