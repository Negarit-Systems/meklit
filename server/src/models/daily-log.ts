export interface DailyLog {
  id?: string;
  childId: string;
  staffId: string;
  timestamp: Date;
  type: 'Meal' | 'Nap' | 'Diaper' | 'Mood' | 'General Activity';
  details: string;
}
