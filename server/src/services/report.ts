import { CollectionReference } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { DailyLog, DailyLogEnum } from '../models/daily-log.js';
import {
  HealthRecordEntry,
  HealthRecordEnum,
} from '../models/health-record.js';
import { ChildService } from './child-service.js';
import {
  ClassComparisonData,
  ClassReportData,
} from '../types/report-response.js';

export class ClassReportService {
  private dailyLogRef: CollectionReference;
  private healthRecordRef: CollectionReference;
  private childService: ChildService;

  constructor() {
    this.dailyLogRef = db.collection('dailyLogsEntries');
    this.healthRecordRef = db.collection('healthRecordEntries');
    this.childService = new ChildService();
  }

  private async getChildMap(
    ids: string[],
  ): Promise<Map<string, any>> {
    const children = await this.childService.findMany(ids);
    const map = new Map<string, any>();
    for (const child of children) {
      if (child.id) {
        map.set(child.id, child);
      }
    }
    return map;
  }

  async generateReport(
    startDate?: string,
    endDate?: string,
  ): Promise<ClassReportData[]> {
    const classStats: Record<
      string,
      {
        totalNapDuration: number;
        napCount: number;
        totalIncidents: number;
      }
    > = {};

    // Build nap query
    let napQuery = this.dailyLogRef.where(
      'type',
      '==',
      DailyLogEnum.Nap,
    );
    if (startDate)
      napQuery = napQuery.where(
        'timestamp',
        '>=',
        new Date(startDate),
      );
    if (endDate)
      napQuery = napQuery.where('timestamp', '<=', new Date(endDate));
    const napSnapshot = await napQuery.get();

    const napLogs: DailyLog[] = [];
    const napChildIds = new Set<string>();
    for (const doc of napSnapshot.docs) {
      const log = doc.data() as DailyLog;
      napLogs.push(log);
      napChildIds.add(log.childId);
    }

    // Build incident query
    let incidentQuery = this.healthRecordRef.where(
      'type',
      '==',
      HealthRecordEnum.Incident,
    );
    if (startDate)
      incidentQuery = incidentQuery.where(
        'timestamp',
        '>=',
        new Date(startDate),
      );
    if (endDate)
      incidentQuery = incidentQuery.where(
        'timestamp',
        '<=',
        new Date(endDate),
      );
    const incidentSnapshot = await incidentQuery.get();

    const incidentRecords: HealthRecordEntry[] = [];
    const incidentChildIds = new Set<string>();
    for (const doc of incidentSnapshot.docs) {
      const record = doc.data() as HealthRecordEntry;
      incidentRecords.push(record);
      incidentChildIds.add(record.childId);
    }

    // Batch fetch all children
    const allChildIds = Array.from(
      new Set([...napChildIds, ...incidentChildIds]),
    );

    if (allChildIds.length === 0) {
      return [];
    }

    const childMap = await this.getChildMap(allChildIds);

    // Pre-populate classStats with all possible classes
    for (const child of childMap.values()) {
      if (child && child.centerId && !classStats[child.centerId]) {
        classStats[child.centerId] = {
          totalNapDuration: 0,
          napCount: 0,
          totalIncidents: 0,
        };
      }
    }

    // Process nap logs
    for (const log of napLogs) {
      if (!log.details.sleepDuration) continue;
      const child = childMap.get(log.childId);
      if (!child || !child.centerId) continue;
      const classId = child.centerId;
      if (classStats[classId]) {
        classStats[classId].totalNapDuration +=
          log.details.sleepDuration;
        classStats[classId].napCount++;
      }
    }

    // Process incident logs
    for (const record of incidentRecords) {
      const child = childMap.get(record.childId);
      if (!child || !child.centerId) continue;
      const classId = child.centerId;
      if (classStats[classId]) {
        classStats[classId].totalIncidents++;
      }
    }

    // Format the final report
    return Object.entries(classStats).map(([classId, stats]) => ({
      classId,
      averageNapDuration:
        stats.napCount > 0
          ? stats.totalNapDuration / stats.napCount
          : 0,
      totalIncidents: stats.totalIncidents,
    }));
  }

  async compareClassesReport(
    classId1: string,
    classId2: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ClassComparisonData[]> {
    const classIdsToCompare = [classId1, classId2];
    const classStats: Record<
      string,
      {
        totalNapDuration: number;
        napCount: number;
        totalIncidents: number;
      }
    > = {
      [classId1]: {
        totalNapDuration: 0,
        napCount: 0,
        totalIncidents: 0,
      },
      [classId2]: {
        totalNapDuration: 0,
        napCount: 0,
        totalIncidents: 0,
      },
    };
    let napQuery = this.dailyLogRef.where(
      'type',
      '==',
      DailyLogEnum.Nap,
    );
    if (startDate)
      napQuery = napQuery.where(
        'timestamp',
        '>=',
        new Date(startDate),
      );
    if (endDate)
      napQuery = napQuery.where('timestamp', '<=', new Date(endDate));
    const napSnapshot = await napQuery.get();
    const napLogs: DailyLog[] = [];
    const napChildIds = new Set<string>();
    for (const doc of napSnapshot.docs) {
      const log = doc.data() as DailyLog;
      napLogs.push(log);
      napChildIds.add(log.childId);
    }
    let incidentQuery = this.healthRecordRef.where(
      'type',
      '==',
      HealthRecordEnum.Incident,
    );
    if (startDate)
      incidentQuery = incidentQuery.where(
        'timestamp',
        '>=',
        new Date(startDate),
      );
    if (endDate)
      incidentQuery = incidentQuery.where(
        'timestamp',
        '<=',
        new Date(endDate),
      );
    const incidentSnapshot = await incidentQuery.get();
    const incidentRecords: HealthRecordEntry[] = [];
    const incidentChildIds = new Set<string>();
    for (const doc of incidentSnapshot.docs) {
      const record = doc.data() as HealthRecordEntry;
      incidentRecords.push(record);
      incidentChildIds.add(record.childId);
    }
    const allChildIds = Array.from(
      new Set([...napChildIds, ...incidentChildIds]),
    );
    const childMap = await this.getChildMap(allChildIds);
    for (const log of napLogs) {
      const child = childMap.get(log.childId);
      if (
        child &&
        child.centerId &&
        classIdsToCompare.includes(child.centerId) &&
        log.details.sleepDuration
      ) {
        classStats[child.centerId].totalNapDuration +=
          log.details.sleepDuration;
        classStats[child.centerId].napCount++;
      }
    }
    for (const record of incidentRecords) {
      const child = childMap.get(record.childId);
      if (
        child &&
        child.centerId &&
        classIdsToCompare.includes(child.centerId)
      ) {
        classStats[child.centerId].totalIncidents++;
      }
    }
    return Object.entries(classStats).map(([classId, stats]) => ({
      classId,
      averageNapDuration:
        stats.napCount > 0
          ? stats.totalNapDuration / stats.napCount
          : 0,
      totalIncidents: stats.totalIncidents,
    }));
  }
}
