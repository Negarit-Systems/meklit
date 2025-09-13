import { CollectionReference } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { DailyLog, DailyLogEnum } from '../models/daily-log.js';
import {
  HealthRecordEntry,
  HealthRecordEnum,
} from '../models/health-record.js';
import { ChildService } from './child-service.js';
import {
  ActivityEngagementData,
  ClassComparisonData,
  ClassActivityEngagement,
} from '../types/report-response.js';

export interface ClassReportData {
  classId: string;
  averageNapDuration: number;
  totalIncidents: number;
}

export class ClassReportService {
  private dailyLogRef: CollectionReference;
  private healthRecordRef: CollectionReference;
  private childService: ChildService;

  constructor() {
    this.dailyLogRef = db.collection('dailyLogs');
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
    startDate: string,
    endDate: string,
  ): Promise<ClassReportData[]> {
    const classStats: Record<
      string,
      {
        totalNapDuration: number;
        napCount: number;
        totalIncidents: number;
      }
    > = {};

    // Collect nap logs and childIds
    const napQuery = this.dailyLogRef
      .where('type', '==', DailyLogEnum.Nap)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));
    const napSnapshot = await napQuery.get();
    const napLogs: DailyLog[] = [];
    const napChildIds = new Set<string>();
    for (const doc of napSnapshot.docs) {
      const log = doc.data() as DailyLog;
      napLogs.push(log);
      napChildIds.add(log.childId);
    }

    // Collect incident logs and childIds
    const incidentQuery = this.healthRecordRef
      .where('type', '==', HealthRecordEnum.Incident)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));
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
    const childMap = await this.getChildMap(allChildIds);

    // Process nap logs
    for (const log of napLogs) {
      if (!log.details.sleepDuration) continue;
      const child = childMap.get(log.childId);
      if (!child || !child.centerId) continue;
      const classId = child.centerId;
      if (!classStats[classId]) {
        classStats[classId] = {
          totalNapDuration: 0,
          napCount: 0,
          totalIncidents: 0,
        };
      }
      classStats[classId].totalNapDuration +=
        log.details.sleepDuration;
      classStats[classId].napCount++;
    }

    // Process incident logs
    for (const record of incidentRecords) {
      const child = childMap.get(record.childId);
      if (!child || !child.centerId) continue;
      const classId = child.centerId;
      if (!classStats[classId]) {
        classStats[classId] = {
          totalNapDuration: 0,
          napCount: 0,
          totalIncidents: 0,
        };
      }
      classStats[classId].totalIncidents++;
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

  async activityEngagementReport(
    startDate: string,
    endDate: string,
    centerId?: string,
  ): Promise<ActivityEngagementData[]> {
    const activityStats: Record<
      string,
      { engagementCounts: Record<string, number> }
    > = {};

    const activityQuery = this.dailyLogRef
      .where('type', '==', DailyLogEnum.GeneralActivity)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));
    const activitySnapshot = await activityQuery.get();
    const activityLogs: DailyLog[] = [];
    const childIds = new Set<string>();
    for (const doc of activitySnapshot.docs) {
      const log = doc.data() as DailyLog;
      activityLogs.push(log);
      childIds.add(log.childId);
    }

    // Batch fetch children
    const childMap = await this.getChildMap(Array.from(childIds));

    for (const log of activityLogs) {
      const engagementLevel = log.details.activityEngagementLevel;
      const activityName = (log.details.other as any)?.activityName;
      if (!engagementLevel || !activityName) continue;

      // If filtering by center, check the child's centerId
      if (centerId) {
        const child = childMap.get(log.childId);
        if (!child || child.centerId !== centerId) continue;
      }

      if (!activityStats[activityName]) {
        activityStats[activityName] = { engagementCounts: {} };
      }
      activityStats[activityName].engagementCounts[engagementLevel] =
        (activityStats[activityName].engagementCounts[
          engagementLevel
        ] || 0) + 1;
    }

    return Object.entries(activityStats).map(
      ([activityName, { engagementCounts }]) => ({
        activityName,
        engagementCounts,
      }),
    );
  }

  async compareClassesReport(
    startDate: string,
    endDate: string,
    classId1: string,
    classId2: string,
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

    // Collect nap logs and childIds
    const napQuery = this.dailyLogRef
      .where('type', '==', DailyLogEnum.Nap)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));
    const napSnapshot = await napQuery.get();
    const napLogs: DailyLog[] = [];
    const napChildIds = new Set<string>();
    for (const doc of napSnapshot.docs) {
      const log = doc.data() as DailyLog;
      napLogs.push(log);
      napChildIds.add(log.childId);
    }

    // Collect incident logs and childIds
    const incidentQuery = this.healthRecordRef
      .where('type', '==', HealthRecordEnum.Incident)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));
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
    const childMap = await this.getChildMap(allChildIds);

    // Process nap logs
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

    // Process incident logs
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

  async compareActivityEngagement(
    startDate: string,
    endDate: string,
    classId1: string,
    classId2: string,
  ): Promise<ClassActivityEngagement[]> {
    const classIdsToCompare = [classId1, classId2];
    const classActivityStats: Record<
      string,
      Record<string, { engagementCounts: Record<string, number> }>
    > = {
      [classId1]: {},
      [classId2]: {},
    };

    const activityQuery = this.dailyLogRef
      .where('type', '==', DailyLogEnum.GeneralActivity)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));
    const activitySnapshot = await activityQuery.get();
    const activityLogs: DailyLog[] = [];
    const childIds = new Set<string>();
    for (const doc of activitySnapshot.docs) {
      const log = doc.data() as DailyLog;
      activityLogs.push(log);
      childIds.add(log.childId);
    }

    // Batch fetch children
    const childMap = await this.getChildMap(Array.from(childIds));

    for (const log of activityLogs) {
      const child = childMap.get(log.childId);
      if (
        !child ||
        !child.centerId ||
        !classIdsToCompare.includes(child.centerId)
      )
        continue;

      const classId = child.centerId;
      const engagementLevel = log.details.activityEngagementLevel;
      const activityName = (log.details.other as any)?.activityName;
      if (!engagementLevel || !activityName) continue;

      if (!classActivityStats[classId][activityName]) {
        classActivityStats[classId][activityName] = {
          engagementCounts: {},
        };
      }
      const counts =
        classActivityStats[classId][activityName].engagementCounts;
      counts[engagementLevel] = (counts[engagementLevel] || 0) + 1;
    }

    return Object.entries(classActivityStats).map(
      ([classId, activities]) => ({
        classId,
        activities: Object.entries(activities).map(
          ([activityName, { engagementCounts }]) => ({
            activityName,
            engagementCounts,
          }),
        ),
      }),
    );
  }
}
