import * as SQLite from 'expo-sqlite';
import { PrayerRequest, PrayerRequestCreate, PrayerRequestUpdate } from '../types/PrayerRequest';

// 使用与主数据库相同的连接
const db = SQLite.openDatabaseSync('prayers.db');

export const createPrayerRequest = (request: PrayerRequestCreate): PrayerRequest => {
  const now = new Date().toISOString();
  const result = db.runSync(
    `INSERT INTO prayer_requests (
      title, description, request_date, status,
      answered_date, answer_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      request.title,
      request.description,
      request.requestDate.toISOString(),
      request.status,
      request.answeredDate?.toISOString() || null,
      request.answerNotes || null,
      now,
      now
    ]
  );

  return {
    id: result.lastInsertRowId,
    ...request,
    createdAt: new Date(now),
    updatedAt: new Date(now)
  };
};

export const updatePrayerRequest = (id: number, update: PrayerRequestUpdate): void => {
  const updates: string[] = [];
  const values: any[] = [];
  
  Object.entries(update).forEach(([key, value]) => {
    if (value !== undefined) {
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      updates.push(`${dbKey} = ?`);
      values.push(value instanceof Date ? value.toISOString() : value);
    }
  });
  
  if (updates.length === 0) {
    return;
  }

  const now = new Date().toISOString();
  values.push(now);
  values.push(id);

  db.runSync(
    `UPDATE prayer_requests SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`,
    values
  );
};

export const getPrayerRequests = (status?: PrayerRequest['status']): PrayerRequest[] => {
  const whereClause = status ? 'WHERE status = ?' : '';
  const params = status ? [status] : [];

  const rows = db.getAllSync<any>(
    `SELECT * FROM prayer_requests ${whereClause} ORDER BY request_date DESC`,
    params
  );

  return rows.map(row => ({
    ...row,
    requestDate: new Date(row.request_date),
    answeredDate: row.answered_date ? new Date(row.answered_date) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }));
};

export const deletePrayerRequest = (id: number): void => {
  db.runSync('DELETE FROM prayer_requests WHERE id = ?', [id]);
}; 