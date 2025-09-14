import { CollectionReference } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { DailyLog, DailyLogEnum } from '../models/daily-log.js';
import {
  HealthRecordEntry,
  HealthRecordEnum,
} from '../models/health-record.js';
import { ChildService } from './child-service.js';
import {
  ComparisonData,
  SummaryReportData,
  ChildComparisonData,
  HealthEvent,
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
    this.dailyLogRef = db.collection('dailyLogEntries');
    this.healthRecordRef = db.collection('healthRecordEntries');
    this.childService = new ChildService();
  }

  // ... (generateReport, compareClassesReport, compareCentersReport methods are unchanged)
  private async getChildMap(
    ids: string[],
  ): Promise<Map<string, any>> {
    const children = await this.childService.find({
      where: {
        field: 'id',
        operator: 'in',
        value: Array.from(ids),
      },
    });
    const map = new Map<string, any>();
    for (const child of children) {
      if (child.id) {
        map.set(child.id, child);
      }
    }
    return map;
  }

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
      if (!log.details?.sleepDuration) continue;
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

    return Object.entries(stats).map(([id, data]) => ({
      id,
      averageNapDuration:
        data.napCount > 0 ? data.totalNapDuration / data.napCount : 0,
      totalIncidents: data.totalIncidents,
    }));
  }

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

  async compareChildrenReport(
    childId1: string,
    childId2: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ChildComparisonData[]> {
    const childIdsToCompare = [childId1, childId2];
    const childStats: Record<
      string,
      {
        totalIncidents: number;
        totalMedications: number;
        totalNapDuration: number;
        napCount: number;
        healthEvents: HealthEvent[];
      }
    > = {
      [childId1]: {
        totalIncidents: 0,
        totalMedications: 0,
        totalNapDuration: 0,
        napCount: 0,
        healthEvents: [],
      },
      [childId2]: {
        totalIncidents: 0,
        totalMedications: 0,
        totalNapDuration: 0,
        napCount: 0,
        healthEvents: [],
      },
    };

    const healthRecordTypes = [
      HealthRecordEnum.Incident,
      HealthRecordEnum.MedicationAdministered,
    ];
    let healthQuery = this.healthRecordRef
      .where('childId', 'in', childIdsToCompare)
      .where('type', 'in', healthRecordTypes);

    let napQuery = this.dailyLogRef
      .where('childId', 'in', childIdsToCompare)
      .where('type', '==', DailyLogEnum.Nap);

    if (startDate) {
      healthQuery = healthQuery.where(
        'timestamp',
        '>=',
        new Date(startDate),
      );
      napQuery = napQuery.where(
        'timestamp',
        '>=',
        new Date(startDate),
      );
    }
    if (endDate) {
      healthQuery = healthQuery.where(
        'timestamp',
        '<=',
        new Date(endDate),
      );
      napQuery = napQuery.where('timestamp', '<=', new Date(endDate));
    }

    const [healthSnapshot, napSnapshot] = await Promise.all([
      healthQuery.get(),
      napQuery.get(),
    ]);

    

    healthSnapshot.forEach((doc) => {
      const record = doc.data() as HealthRecordEntry;
      const childStat = childStats[record.childId];

      if (childStat) {
        let eventDetail = '';
        if (record.type === HealthRecordEnum.Incident) {
          childStat.totalIncidents++;
          eventDetail = record.details.incident || 'Unknown Incident';
        } else if (
          record.type === HealthRecordEnum.MedicationAdministered
        ) {
          childStat.totalMedications++;
          eventDetail =
            record.details.medication || 'Unknown Medication';
        }

        childStat.healthEvents.push({
          timestamp: record.timestamp,
          type: record.type as 'Incident' | 'Medication Administered',
          detail: eventDetail,
        });
      }
    });

    napSnapshot.forEach((doc) => {
      const log = doc.data() as DailyLog;
      if (childStats[log.childId] && log.details?.sleepDuration) {
        childStats[log.childId].totalNapDuration +=
          log.details.sleepDuration;
        childStats[log.childId].napCount++;
      }
    });

    return Object.entries(childStats).map(([childId, stats]) => {
      stats.healthEvents.sort(
        (a, b) => a.timestamp._seconds - b.timestamp._seconds,
      );

      return {
        childId,
        totalIncidents: stats.totalIncidents,
        totalMedications: stats.totalMedications,
        totalNapDuration: stats.totalNapDuration,
        averageNapDuration:
          stats.napCount > 0
            ? stats.totalNapDuration / stats.napCount
            : 0,
        healthEvents: stats.healthEvents,
      };
    });
  }
}
