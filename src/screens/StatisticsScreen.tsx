import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { usePrayer } from '../contexts/PrayerContext';
import * as Database from '../services/database';
import { PrayerTypeStats, MonthlyStats } from '../types';

const StatisticsScreen = () => {
  const { prayers } = usePrayer();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalStats, setTotalStats] = useState<{ totalMinutes: number, prayerCount: number }>({ totalMinutes: 0, prayerCount: 0 });
  const [typeStats, setTypeStats] = useState<PrayerTypeStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);

  // 加载统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        
        // 获取总体统计数据
        const stats = Database.getPrayerStats();
        setTotalStats(stats);
        
        // 获取按类型分组的统计数据
        const typeStatsData = Database.getPrayerStatsByType();
        setTypeStats(typeStatsData);
        
        // 获取按月分组的统计数据
        const monthlyStatsData = Database.getMonthlyPrayerStats();
        setMonthlyStats(monthlyStatsData);
      } catch (error) {
        console.error('加载统计数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [prayers]);

  // 准备月度统计图表数据
  const chartData = {
    labels: monthlyStats.map(item => item.month.substring(5)), // 只显示月份
    datasets: [
      {
        data: monthlyStats.map(item => item.totalMinutes || 0),
      },
    ],
  };

  // 图表配置
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
  };

  // 渲染类型统计卡片
  const renderTypeStatCard = (stat: PrayerTypeStats) => (
    <View key={stat.type} style={styles.typeStatCard}>
      <Text style={styles.typeStatTitle}>{stat.type}</Text>
      <View style={styles.typeStatRow}>
        <View style={styles.typeStatItem}>
          <Text style={styles.typeStatValue}>{stat.count}</Text>
          <Text style={styles.typeStatLabel}>次数</Text>
        </View>
        <View style={styles.typeStatItem}>
          <Text style={styles.typeStatValue}>{Math.round(stat.totalMinutes)}</Text>
          <Text style={styles.typeStatLabel}>分钟</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 总体统计 */}
      <View style={styles.totalStatsContainer}>
        <View style={styles.totalStatCard}>
          <Ionicons name="time-outline" size={32} color="#6200ee" />
          <Text style={styles.totalStatValue}>{Math.round(totalStats.totalMinutes)}</Text>
          <Text style={styles.totalStatLabel}>总祷告分钟</Text>
        </View>
        <View style={styles.totalStatCard}>
          <Ionicons name="calendar-outline" size={32} color="#6200ee" />
          <Text style={styles.totalStatValue}>{totalStats.prayerCount}</Text>
          <Text style={styles.totalStatLabel}>总祷告次数</Text>
        </View>
      </View>

      {/* 类型统计 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>按类型统计</Text>
        <View style={styles.typeStatsContainer}>
          {typeStats.length > 0 ? (
            typeStats.map(renderTypeStatCard)
          ) : (
            <Text style={styles.emptyText}>暂无数据</Text>
          )}
        </View>
      </View>

      {/* 月度统计图表 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>月度祷告分钟数</Text>
        {monthlyStats.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
              yAxisLabel=""
              yAxisSuffix="分钟"
            />
          </View>
        ) : (
          <Text style={styles.emptyText}>暂无数据</Text>
        )}
      </View>
    </ScrollView>
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
  totalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  totalStatCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  totalStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginVertical: 8,
  },
  totalStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  sectionContainer: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  typeStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeStatCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  typeStatTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  typeStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeStatItem: {
    alignItems: 'center',
  },
  typeStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  typeStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  chart: {
    borderRadius: 8,
    paddingRight: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 24,
  },
});

export default StatisticsScreen; 