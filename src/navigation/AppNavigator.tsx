import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// 导入屏幕
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PrayerDetailScreen from '../screens/PrayerDetailScreen';
import NewPrayerScreen from '../screens/NewPrayerScreen';
import { PrayerRequestsScreen } from '../screens/PrayerRequestsScreen';

// 定义导航参数类型
export type RootStackParamList = {
  Main: undefined;
  PrayerDetail: { prayerId: number };
  NewPrayer: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  PrayerRequests: undefined;
  Statistics: undefined;
  Settings: undefined;
};

// 创建导航器
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 主标签导航器
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'PrayerRequests') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Statistics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: '祷告' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: '历史' }}
      />
      <Tab.Screen 
        name="PrayerRequests" 
        component={PrayerRequestsScreen} 
        options={{ title: '代祷事项' }}
      />
      <Tab.Screen 
        name="Statistics" 
        component={StatisticsScreen} 
        options={{ title: '统计' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: '设置' }}
      />
    </Tab.Navigator>
  );
};

// 根堆栈导航器
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PrayerDetail" 
          component={PrayerDetailScreen} 
          options={{ title: '祷告详情' }}
        />
        <Stack.Screen 
          name="NewPrayer" 
          component={NewPrayerScreen} 
          options={{ title: '新建祷告' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 