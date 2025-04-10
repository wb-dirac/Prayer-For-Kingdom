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
  const [dailyStats, setDailyStats] = useState<{ date: string, minutes: number }[]>([]);

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

        // 获取每日统计数据
        const dailyStatsData = Database.getDailyPrayerStats();
        setDailyStats(dailyStatsData);
      } catch (error) {
        console.error('加载统计数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [prayers]);

  // 准备月度统计图表数据
  const monthlyChartData = {
    labels: monthlyStats.map(item => item.month.substring(5)),
    datasets: [
      {
        data: monthlyStats.map(item => item.totalMinutes || 0),
      },
    ],
  };

  // 准备每日统计图表数据
  const dailyChartData = {
    labels: dailyStats.map(item => item.date.substring(8)),
    datasets: [
      {
        data: dailyStats.map(item => item.minutes || 0),
      },
    ],
  };

  // 获取最大值来设置合适的Y轴范围
  const maxDailyValue = Math.max(...dailyStats.map(item => item.minutes || 0));
  const maxMonthlyValue = Math.max(...monthlyStats.map(item => item.totalMinutes || 0));

  // 图表配置
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    fillShadowGradientFrom: '#6200ee',
    fillShadowGradientTo: '#6200ee',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    useShadowColorFromDataset: false,
    barRadius: 4,
    propsForBackgroundLines: {
      strokeWidth: 1,
      strokeDasharray: '6',
      stroke: '#e0e0e0',
    },
    propsForLabels: {
      fontSize: 10,
      fontWeight: '400',
    },
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

      {/* 每日统计图表 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>每日祷告分钟数</Text>
        {dailyStats.length > 0 ? (
          <View style={styles.chartContainer}>
            <View style={styles.chartWithYAxis}>
              {/* 固定的Y轴标签 */}
              <View style={styles.yAxisContainer}>
                {Array.from({ length: 6 }).map((_, index) => {
                  const maxValue = Math.max(...dailyStats.map(item => item.minutes || 0));
                  const value = Math.round(maxValue * (5 - index) / 5);
                  return (
                    <Text key={index} style={styles.yAxisLabel}>
                      {value}
                    </Text>
                  );
                })}
              </View>
              
              {/* 可滚动的图表内容 */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.horizontalScrollContent}
                ref={scrollViewRef => {
                  // 在组件加载完成后滚动到最右端
                  if (scrollViewRef && dailyStats.length > 0) {
                    setTimeout(() => {
                      scrollViewRef.scrollToEnd({ animated: false });
                    }, 100);
                  }
                }}
              >
                <BarChart
                  data={{
                    labels: dailyStats.map(item => item.date.substring(8)),
                    datasets: [{
                      data: dailyStats.map(item => item.minutes || 0),
                    }],
                  }}
                  width={Math.max(Dimensions.get('window').width - 80, dailyStats.length * 25)}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    barPercentage: 0.4,
                    propsForLabels: {
                      ...chartConfig.propsForLabels,
                      fontSize: 10,
                    }
                  }}
                  style={styles.chart}
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix=""
                  showBarTops={false}
                  withInnerLines={true}
                  withHorizontalLabels={false}
                  withVerticalLabels={true}
                  segments={5}
                  yAxisInterval={1}
                  verticalLabelRotation={-45}
                  horizontalLabelRotation={0}
                  showValuesOnTopOfBars={false}
                />
              </ScrollView>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>暂无数据</Text>
        )}
      </View>

      {/* 月度统计图表 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>月度祷告分钟数</Text>
        {monthlyStats.length > 0 ? (
          <View style={styles.chartContainer}>
            <View style={styles.chartWithYAxis}>
              {/* 固定的Y轴标签 */}
              <View style={styles.yAxisContainer}>
                {Array.from({ length: 6 }).map((_, index) => {
                  const maxValue = Math.max(...monthlyStats.map(item => item.totalMinutes || 0));
                  const value = Math.round(maxValue * (5 - index) / 5);
                  return (
                    <Text key={index} style={styles.yAxisLabel}>
                      {value}
                    </Text>
                  );
                })}
              </View>
              
              {/* 可滚动的图表内容 */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.horizontalScrollContent}
                ref={scrollViewRef => {
                  if (scrollViewRef && monthlyStats.length > 0) {
                    setTimeout(() => {
                      scrollViewRef.scrollToEnd({ animated: false });
                    }, 100);
                  }
                }}
              >
                <BarChart
                  data={{
                    labels: monthlyStats.map(item => item.month.substring(5)),
                    datasets: [{
                      data: monthlyStats.map(item => item.totalMinutes || 0),
                    }],
                  }}
                  width={Math.max(
                    Dimensions.get('window').width - 80,
                    Math.max(monthlyStats.length * 30, 200)
                  )}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    barPercentage: 0.7,
                    propsForLabels: {
                      ...chartConfig.propsForLabels,
                      fontSize: 10
                    }
                  }}
                  style={styles.chart}
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix=""
                  showBarTops={false}
                  withInnerLines={true}
                  withHorizontalLabels={false}
                  withVerticalLabels={true}
                  segments={5}
                  yAxisInterval={1}
                  verticalLabelRotation={-45}
                  horizontalLabelRotation={0}
                  showValuesOnTopOfBars={false}
                />
              </ScrollView>
            </View>
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
  horizontalScrollContent: {
    paddingRight: 16,
  },
  chartWithYAxis: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  yAxisContainer: {
    width: 30,
    height: 220,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
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
    paddingRight: 36,
    paddingLeft: 24,
    marginVertical: 8,
    marginLeft: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 24,
  },
});

export default StatisticsScreen;
