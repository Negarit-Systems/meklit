import { CollectionReference } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { DailyLog, DailyLogEnum } from '../models/daily-log.js';
import {
  HealthRecordEntry,
  HealthRecordEnum,
} from '../models/health-record.js';
import { ChildService } from './child-service.js';
// UPDATED IMPORT: Use the new, more accurate types
import {
  ComparisonData,
  SummaryReportData,
} from '../types/report-response.js';

interface ReportOptions {
  startDate?: string;
  endDate?: string;
  centerId?: string;
  groupBy?: 'center' | 'class';
}

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

  // UPDATED RETURN TYPE
  async generateReport(
    options: ReportOptions = {},
  ): Promise<SummaryReportData[]> {
    const {
      startDate,
      endDate,
      centerId,
      groupBy = 'center',
    } = options;

    const stats: Record<
      string,
      {
        totalNapDuration: number;
        napCount: number;
        totalIncidents: number;
      }
    > = {};

    let napQuery = this.dailyLogRef.where(
      'type',
      '==',
      DailyLogEnum.Nap,
    );
    let incidentQuery = this.healthRecordRef.where(
      'type',
      '==',
      HealthRecordEnum.Incident,
    );

    if (startDate) {
      napQuery = napQuery.where(
        'timestamp',
        '>=',
        new Date(startDate),
      );
      incidentQuery = incidentQuery.where(
        'timestamp',
        '>=',
        new Date(startDate),
      );
    }
    if (endDate) {
      napQuery = napQuery.where('timestamp', '<=', new Date(endDate));
      incidentQuery = incidentQuery.where(
        'timestamp',
        '<=',
        new Date(endDate),
      );
    }

    const [napSnapshot, incidentSnapshot] = await Promise.all([
      napQuery.get(),
      incidentQuery.get(),
    ]);

    const allChildIds = new Set<string>();
    const napLogs: DailyLog[] = napSnapshot.docs.map((doc) => {
      const log = doc.data() as DailyLog;
      allChildIds.add(log.childId);
      return log;
    });
    const incidentRecords: HealthRecordEntry[] =
      incidentSnapshot.docs.map((doc) => {
        const record = doc.data() as HealthRecordEntry;
        allChildIds.add(record.childId);
        return record;
      });

    if (allChildIds.size === 0) return [];

    let childMap = await this.getChildMap(Array.from(allChildIds));

    if (centerId) {
      const filteredChildMap = new Map<string, any>();
      for (const [childId, childData] of childMap.entries()) {
        if (childData.centerId === centerId) {
          filteredChildMap.set(childId, childData);
        }
      }
      childMap = filteredChildMap;
    }

    const groupingKeyField =
      groupBy === 'class' ? 'classId' : 'centerId';

    for (const log of napLogs) {
      if (!log.details.sleepDuration) continue;
      const child = childMap.get(log.childId);
      if (!child || !child[groupingKeyField]) continue;

      const key = child[groupingKeyField];
      if (!stats[key])
        stats[key] = {
          totalNapDuration: 0,
          napCount: 0,
          totalIncidents: 0,
        };

      stats[key].totalNapDuration += log.details.sleepDuration;
      stats[key].napCount++;
    }

    for (const record of incidentRecords) {
      const child = childMap.get(record.childId);
      if (!child || !child[groupingKeyField]) continue;

      const key = child[groupingKeyField];
      if (!stats[key])
        stats[key] = {
          totalNapDuration: 0,
          napCount: 0,
          totalIncidents: 0,
        };

      stats[key].totalIncidents++;
    }

    // This return type now matches SummaryReportData[]
    return Object.entries(stats).map(([id, data]) => ({
      id,
      averageNapDuration:
        data.napCount > 0 ? data.totalNapDuration / data.napCount : 0,
      totalIncidents: data.totalIncidents,
    }));
  }

  // UPDATED RETURN TYPE
  async compareClassesReport(
    classId1: string,
    classId2: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ComparisonData[]> {
    const reportData = await this.generateReport({
      startDate,
      endDate,
      groupBy: 'class',
    });
    return reportData.filter(
      (item) => item.id === classId1 || item.id === classId2,
    );
  }

  // UPDATED RETURN TYPE
  async compareCentersReport(
    centerId1: string,
    centerId2: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ComparisonData[]> {
    const reportData = await this.generateReport({
      startDate,
      endDate,
      groupBy: 'center',
    });
    return reportData.filter(
      (item) => item.id === centerId1 || item.id === centerId2,
    );
  }
}
