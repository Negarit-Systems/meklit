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

    // 1. Calculate average nap times
    const napQuery = this.dailyLogRef
      .where('type', '==', DailyLogEnum.Nap)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));

    const napSnapshot = await napQuery.get();

    for (const doc of napSnapshot.docs) {
      const log = doc.data() as DailyLog;
      if (!log.details.sleepDuration) continue;

      const child = await this.childService.findOne(log.childId);
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

    // 2. Calculate total incidents
    const incidentQuery = this.healthRecordRef
      .where('type', '==', HealthRecordEnum.Incident)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));

    const incidentSnapshot = await incidentQuery.get();

    for (const doc of incidentSnapshot.docs) {
      const record = doc.data() as HealthRecordEntry;
      const child = await this.childService.findOne(record.childId);
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

    // 3. Format the final report
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

    for (const doc of activitySnapshot.docs) {
      const log = doc.data() as DailyLog;
      const engagementLevel = log.details.activityEngagementLevel;
      // Assuming the activity name is stored in details.other
      const activityName = (log.details.other as any)?.activityName;

      if (!engagementLevel || !activityName) {
        continue;
      }

      // If filtering by center, check the child's centerId
      if (centerId) {
        const child = await this.childService.findOne(log.childId);
        if (!child || child.centerId !== centerId) {
          continue;
        }
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

    // 1. Calculate nap times for the two classes
    const napQuery = this.dailyLogRef
      .where('type', '==', DailyLogEnum.Nap)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));

    const napSnapshot = await napQuery.get();

    for (const doc of napSnapshot.docs) {
      const log = doc.data() as DailyLog;
      const child = await this.childService.findOne(log.childId);

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

    // 2. Calculate incidents for the two classes
    const incidentQuery = this.healthRecordRef
      .where('type', '==', HealthRecordEnum.Incident)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate));

    const incidentSnapshot = await incidentQuery.get();

    for (const doc of incidentSnapshot.docs) {
      const record = doc.data() as HealthRecordEntry;
      const child = await this.childService.findOne(record.childId);

      if (
        child &&
        child.centerId &&
        classIdsToCompare.includes(child.centerId)
      ) {
        classStats[child.centerId].totalIncidents++;
      }
    }

    // 3. Format the final report
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

    for (const doc of activitySnapshot.docs) {
      const log = doc.data() as DailyLog;
      const child = await this.childService.findOne(log.childId);

      if (!child || !child.centerId || !classIdsToCompare.includes(child.centerId)) {
        continue;
      }

      const classId = child.centerId;
      const engagementLevel = log.details.activityEngagementLevel;
      const activityName = (log.details.other as any)?.activityName;

      if (!engagementLevel || !activityName) {
        continue;
      }

      if (!classActivityStats[classId][activityName]) {
        classActivityStats[classId][activityName] = { engagementCounts: {} };
      }

      const counts = classActivityStats[classId][activityName].engagementCounts;
      counts[engagementLevel] = (counts[engagementLevel] || 0) + 1;
    }

    return Object.entries(classActivityStats).map(([classId, activities]) => ({
      classId,
      activities: Object.entries(activities).map(
        ([activityName, { engagementCounts }]) => ({
          activityName,
          engagementCounts,
        }),
      ),
    }));
  }
}


