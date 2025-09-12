import { Timestamp } from 'firebase-admin/firestore';

export enum DailyLogEnum {
  Meal = 'Meal',
  Nap = 'Nap',
  Diaper = 'Diaper',
  Mood = 'Mood',
  GeneralActivity = 'General Activity',
}

export interface DailyLog {
  id?: string;
  childId: string;
  staffId: string;
  timestamp: Timestamp;
  type: DailyLogEnum | string;
  details: {
    mealStatus?: string;
    sleepDuration?: number;
    activityEngagementLevel?: string;
    mood?: string;
    other?: unknown;
  };
}
