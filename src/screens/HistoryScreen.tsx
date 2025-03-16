import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePrayer } from '../contexts/PrayerContext';
import { Prayer, PrayerType } from '../types';
import { formatTime, formatDuration, formatDate } from '../utils/timeUtils';

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HistoryScreen = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { prayers, isLoading, refreshPrayers } = usePrayer();
  
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filteredPrayers, setFilteredPrayers] = useState<Prayer[]>([]);

  // 筛选祷告记录
  useEffect(() => {
    let filtered = [...prayers];
    
    // 按类型筛选
    if (selectedType) {
      filtered = filtered.filter(prayer => prayer.type === selectedType);
    }
    
    // 按搜索文本筛选
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        prayer => 
          prayer.title.toLowerCase().includes(searchLower) || 
          (prayer.notes && prayer.notes.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredPrayers(filtered);
  }, [prayers, searchText, selectedType]);

  // 处理查看祷告详情
  const handleViewPrayerDetail = (prayerId: number) => {
    navigation.navigate('PrayerDetail', { prayerId });
  };

  // 渲染祷告类型筛选按钮
  const renderTypeFilterButton = (type: string | null, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedType === type && styles.filterButtonActive
      ]}
      onPress={() => setSelectedType(type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedType === type && styles.filterButtonTextActive
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // 渲染祷告记录项
  const renderPrayerItem = ({ item }: { item: Prayer }) => (
    <TouchableOpacity
      style={styles.prayerItem}
      onPress={() => handleViewPrayerDetail(item.id)}
    >
      <View style={styles.prayerItemContent}>
        <Text style={styles.prayerItemTitle}>{item.title}</Text>
        <View style={styles.prayerItemTypeContainer}>
          <Text style={styles.prayerItemType}>{item.type}</Text>
        </View>
        <Text style={styles.prayerItemTime}>
          {formatTime(new Date(item.startTime))}
        </Text>
        {item.duration && (
          <Text style={styles.prayerItemDuration}>
            持续时间: {formatDuration(item.duration)}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6200ee" />
    </TouchableOpacity>
  );

  // 渲染列表为空时的提示
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>暂无祷告记录</Text>
    </View>
  );

  // 渲染列表分组标题
  const renderSectionHeader = (date: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{date}</Text>
    </View>
  );

  // 按日期分组祷告记录
  const groupPrayersByDate = (prayers: Prayer[]) => {
    const groups: { [key: string]: Prayer[] } = {};
    
    prayers.forEach(prayer => {
      const date = formatDate(new Date(prayer.startTime));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(prayer);
    });
    
    return Object.entries(groups).map(([date, prayers]) => ({
      date,
      data: prayers
    }));
  };

  // 渲染分组列表
  const renderGroupedList = () => {
    const groupedPrayers = groupPrayersByDate(filteredPrayers);
    
    return (
      <FlatList
        data={groupedPrayers}
        keyExtractor={item => item.date}
        renderItem={({ item }) => (
          <View>
            {renderSectionHeader(item.date)}
            {item.data.map(prayer => (
              <View key={prayer.id}>
                {renderPrayerItem({ item: prayer })}
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={filteredPrayers.length === 0 ? { flex: 1 } : {}}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索祷告主题或备注"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 类型筛选 */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTypeFilterButton(null, '全部')}
          {renderTypeFilterButton(PrayerType.DAILY, '日常祷告')}
          {renderTypeFilterButton(PrayerType.WEEKEND, '周末祷告')}
          {renderTypeFilterButton(PrayerType.FASTING, '禁食祷告')}
          {renderTypeFilterButton(PrayerType.OTHER, '其他')}
        </ScrollView>
      </View>

      {/* 祷告记录列表 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : (
        renderGroupedList()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#6200ee',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  prayerItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  prayerItemContent: {
    flex: 1,
  },
  prayerItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  prayerItemTypeContainer: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  prayerItemType: {
    fontSize: 12,
    color: '#666',
  },
  prayerItemTime: {
    fontSize: 12,
    color: '#999',
  },
  prayerItemDuration: {
    fontSize: 12,
    color: '#6200ee',
    marginTop: 4,
  },
});

export default HistoryScreen; 