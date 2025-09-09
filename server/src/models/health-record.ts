export interface HealthRecordEntry {
  id?: string;
  childId: string;
  recordedByUserId: string;
  timestamp: Date;
  type: 'Incident' | 'Medication Administered';
  details: string;
  actionTaken: string;
}
