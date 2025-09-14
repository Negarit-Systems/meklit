export enum HealthRecordEnum {
  Incident = 'Incident',
  MedicationAdministered = 'Medication',
}

export interface HealthRecordEntry {
  id?: string;
  childId: string;
  recordedByUserId: string;
  timestamp: Date;
  type: HealthRecordEnum | string;
  details: {
    incident?: string;
    medication?: string;
    other?: unknown;
  };
  actionTaken: string;
}
