// 祷告类型枚举
export enum PrayerType {
  DAILY = '日常祷告',
  WEEKEND = '周末祷告',
  FASTING = '禁食祷告',
  OTHER = '其他'
}

// 祷告记录接口
export interface Prayer {
  id: number;
  title: string;
  type: PrayerType | string;
  startTime: number; // 时间戳（毫秒）
  endTime?: number; // 时间戳（毫秒）
  duration?: number; // 持续时间（毫秒）
  notes?: string;
}

// 导出/导入数据格式
export interface ExportData {
  prayers: Prayer[];
  version: string;
  exportDate: number;
}

// 统计数据接口
export interface PrayerStats {
  totalMinutes: number;
  prayerCount: number;
}

export interface PrayerTypeStats {
  type: string;
  count: number;
  totalMinutes: number;
}

export interface MonthlyStats {
  month: string;
  totalMinutes: number;
} 