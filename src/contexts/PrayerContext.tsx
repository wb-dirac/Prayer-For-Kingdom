import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Prayer, PrayerType } from '../types';
import * as Database from '../services/database';
import * as FileService from '../services/fileService';

// 上下文接口
interface PrayerContextType {
  prayers: Prayer[];
  activePrayer: Prayer | null;
  isLoading: boolean;
  error: string | null;
  startPrayer: (title: string, type: PrayerType, notes?: string) => Promise<void>;
  endPrayer: () => Promise<void>;
  deletePrayer: (id: number) => Promise<void>;
  refreshPrayers: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: () => Promise<void>;
  addPrayer: (prayer: Omit<Prayer, 'id'>) => Promise<number>;
  updatePrayer: (prayer: Prayer) => Promise<void>;
}

// 创建上下文
const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

// 上下文提供器属性
interface PrayerProviderProps {
  children: ReactNode;
}

// 上下文提供器组件
export const PrayerProvider: React.FC<PrayerProviderProps> = ({ children }) => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [activePrayer, setActivePrayer] = useState<Prayer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化数据库和加载祷告记录
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        // 初始化数据库
        Database.initDatabase();
        // 加载祷告记录
        await refreshPrayers();
      } catch (err) {
        setError('初始化数据库失败');
        console.error('初始化数据库失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // 刷新祷告记录
  const refreshPrayers = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const prayerList = Database.getAllPrayers();
      setPrayers(prayerList);
      
      // 检查是否有正在进行的祷告
      const activePrayerList = prayerList.filter(prayer => prayer.endTime === null || prayer.endTime === undefined);
      if (activePrayerList.length > 0) {
        setActivePrayer(activePrayerList[0]);
      } else {
        setActivePrayer(null);
      }
    } catch (err) {
      setError('加载祷告记录失败');
      console.error('加载祷告记录失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 开始祷告
  const startPrayer = async (title: string, type: PrayerType, notes?: string): Promise<void> => {
    try {
      // 检查是否有正在进行的祷告
      if (activePrayer) {
        Alert.alert(
          '警告',
          '您有一个正在进行的祷告。是否结束当前祷告并开始新的祷告？',
          [
            {
              text: '取消',
              style: 'cancel'
            },
            {
              text: '结束并开始新的',
              onPress: async () => {
                await endPrayer();
                await createNewPrayer();
              }
            }
          ]
        );
      } else {
        await createNewPrayer();
      }
    } catch (err) {
      setError('开始祷告失败');
      console.error('开始祷告失败:', err);
    }

    // 创建新的祷告记录
    async function createNewPrayer() {
      const newPrayer: Omit<Prayer, 'id'> = {
        title,
        type,
        startTime: Date.now(),
        notes: notes || ''
      };

      const id = Database.addPrayer(newPrayer);
      const createdPrayer = { ...newPrayer, id } as Prayer;
      setActivePrayer(createdPrayer);
      await refreshPrayers();
    }
  };

  // 结束祷告
  const endPrayer = async (): Promise<void> => {
    if (!activePrayer) return;

    try {
      const endTime = Date.now();
      Database.endPrayer(activePrayer.id, endTime);
      setActivePrayer(null);
      await refreshPrayers();
    } catch (err) {
      setError('结束祷告失败');
      console.error('结束祷告失败:', err);
    }
  };

  // 删除祷告
  const deletePrayer = async (id: number): Promise<void> => {
    try {
      Database.deletePrayer(id);
      
      // 如果删除的是当前活动的祷告，则清除活动祷告
      if (activePrayer && activePrayer.id === id) {
        setActivePrayer(null);
      }
      
      await refreshPrayers();
    } catch (err) {
      setError('删除祷告失败');
      console.error('删除祷告失败:', err);
    }
  };

  // 导出数据
  const exportData = async (): Promise<void> => {
    try {
      await FileService.exportDataToFile();
    } catch (err) {
      setError('导出数据失败');
      console.error('导出数据失败:', err);
    }
  };

  // 导入数据
  const importData = async (): Promise<void> => {
    try {
      await FileService.importDataFromFile();
      await refreshPrayers();
    } catch (err) {
      setError('导入数据失败');
      console.error('导入数据失败:', err);
    }
  };

  // 添加祷告
  const addPrayer = async (prayer: Omit<Prayer, 'id'>): Promise<number> => {
    const id = Database.addPrayer(prayer);
    await refreshPrayers();
    return id;
  };

  // 更新祷告
  const updatePrayer = async (prayer: Prayer): Promise<void> => {
    Database.updatePrayer(prayer);
    await refreshPrayers();
  };

  // 上下文值
  const contextValue: PrayerContextType = {
    prayers,
    activePrayer,
    isLoading,
    error,
    startPrayer,
    endPrayer,
    deletePrayer,
    refreshPrayers,
    exportData,
    importData,
    addPrayer,
    updatePrayer
  };

  return (
    <PrayerContext.Provider value={contextValue}>
      {children}
    </PrayerContext.Provider>
  );
};

// 自定义钩子，用于访问上下文
export const usePrayer = (): PrayerContextType => {
  const context = useContext(PrayerContext);
  if (context === undefined) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return context;
}; 