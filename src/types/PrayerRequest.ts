export interface PrayerRequest {
  id: number;
  title: string;
  description: string;
  requestDate: Date;
  status: 'active' | 'answered' | 'archived';
  answeredDate?: Date;
  answerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PrayerRequestCreate = Omit<PrayerRequest, 'id' | 'createdAt' | 'updatedAt'>;
export type PrayerRequestUpdate = Partial<Omit<PrayerRequest, 'id' | 'createdAt' | 'updatedAt'>>; 