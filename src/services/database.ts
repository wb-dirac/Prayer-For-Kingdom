import * as SQLite from 'expo-sqlite';
import { PrayerType, Prayer } from '../types';

// 打开数据库连接
const db = SQLite.openDatabaseSync('prayers.db');

// 初始化数据库
export const initDatabase = (): void => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS prayers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      startTime INTEGER NOT NULL,
      endTime INTEGER,
      duration INTEGER,
      notes TEXT
    )
  `);
};

// 添加新的祷告记录
export const addPrayer = (prayer: Omit<Prayer, 'id'>): number => {
  const result = db.runSync(
    `INSERT INTO prayers (title, type, startTime, endTime, duration, notes) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      prayer.title,
      prayer.type,
      prayer.startTime,
      prayer.endTime || null,
      prayer.duration || null,
      prayer.notes || ''
    ]
  );
  return result.lastInsertRowId;
};

// 更新祷告记录
export const updatePrayer = (prayer: Prayer): void => {
  db.runSync(
    `UPDATE prayers 
     SET title = ?, type = ?, startTime = ?, endTime = ?, duration = ?, notes = ?
     WHERE id = ?`,
    [
      prayer.title,
      prayer.type,
      prayer.startTime,
      prayer.endTime || null,
      prayer.duration || null,
      prayer.notes || '',
      prayer.id
    ]
  );
};

// 结束祷告（更新结束时间和持续时间）
export const endPrayer = (id: number, endTime: number): void => {
  db.runSync(
    `UPDATE prayers 
     SET endTime = ?, duration = ? - startTime
     WHERE id = ?`,
    [endTime, endTime, id]
  );
};

// 获取所有祷告记录
export const getAllPrayers = (): Prayer[] => {
  return db.getAllSync<Prayer>('SELECT * FROM prayers ORDER BY startTime DESC');
};

// 获取单个祷告记录
export const getPrayer = (id: number): Prayer | null => {
  return db.getFirstSync<Prayer>('SELECT * FROM prayers WHERE id = ?', [id]) || null;
};

// 删除祷告记录
export const deletePrayer = (id: number): void => {
  db.runSync('DELETE FROM prayers WHERE id = ?', [id]);
};

// 获取统计数据
export const getPrayerStats = (): { totalMinutes: number, prayerCount: number } => {
  const result = db.getFirstSync<{ count: number, totalMinutes: number }>(
    'SELECT COUNT(*) as count, SUM(duration) / 60000 as totalMinutes FROM prayers WHERE duration IS NOT NULL'
  );
  return {
    prayerCount: result?.count || 0,
    totalMinutes: result?.totalMinutes || 0
  };
};

// 获取按类型分组的统计数据
export const getPrayerStatsByType = (): { type: string, count: number, totalMinutes: number }[] => {
  return db.getAllSync<{ type: string, count: number, totalMinutes: number }>(
    `SELECT type, COUNT(*) as count, SUM(duration) / 60000 as totalMinutes 
     FROM prayers 
     WHERE duration IS NOT NULL 
     GROUP BY type`
  );
};

// 获取按月分组的统计数据（用于直方图）
export const getMonthlyPrayerStats = (): { month: string, totalMinutes: number }[] => {
  return db.getAllSync<{ month: string, totalMinutes: number }>(
    `SELECT 
      strftime('%Y-%m', datetime(startTime / 1000, 'unixepoch')) as month,
      SUM(duration) / 60000 as totalMinutes
     FROM prayers 
     WHERE duration IS NOT NULL 
     GROUP BY month
     ORDER BY month ASC
     LIMIT 12`
  );
};

// 获取每日祷告统计数据
export const getDailyPrayerStats = (): { date: string, minutes: number }[] => {
  const prayers = getAllPrayers();
  const dailyStats = new Map<string, number>();

  prayers.forEach(prayer => {
    const date = new Date(prayer.startTime);
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const minutes = dailyStats.get(localDate) || 0;
    dailyStats.set(localDate, minutes + ((prayer.duration || 0) / 60000));  // 转换为分钟
  });

  return Array.from(dailyStats.entries())
    .map(([date, minutes]) => ({ 
      date, 
      minutes: Math.round(minutes) 
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

// 导出数据
export const exportData = (): Prayer[] => {
  return getAllPrayers();
};

// 导入数据
export const importData = (prayers: Prayer[]): void => {
  // 使用事务确保数据完整性
  db.withTransactionSync(() => {
    // 清空现有数据
    db.runSync('DELETE FROM prayers');
    
    // 批量插入新数据
    for (const prayer of prayers) {
      db.runSync(
        `INSERT INTO prayers (id, title, type, startTime, endTime, duration, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          prayer.id,
          prayer.title,
          prayer.type,
          prayer.startTime,
          prayer.endTime || null,
          prayer.duration || null,
          prayer.notes || ''
        ]
      );
    }
  });
}; 