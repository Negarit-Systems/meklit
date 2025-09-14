import { CollectionReference } from 'firebase-admin/firestore';
import { DailyLog, DailyLogEnum } from '../models/daily-log.js';
import { EntityCrudService } from './entity-crud.js';
import { db } from '../config/firebase.js';
import {
  ComparativeData,
  StaffPerformance,
  TrendData,
} from '../types/report-response.js';
import { ChildService } from './child-service.js';

export class DailyLogService extends EntityCrudService<DailyLog> {
  private dailyLogsRef: CollectionReference;
  private childService: ChildService;

  constructor() {
    super('dailyLogEntries');
    this.dailyLogsRef = db.collection('dailyLogEntries');
    this.childService = new ChildService();
  }

  // Trend Over Time Report
  async trendOverTimeReport(
    startDate?: string,
    endDate?: string,
    filter: {
      childId?: string;
      classId?: string;
      centerId?: string;
    } = {},
  ): Promise<TrendData[]> {
    let q: FirebaseFirestore.Query = this.dailyLogsRef;

    if (startDate) {
      q = q.where('timestamp', '>=', new Date(startDate));
    }

    if (endDate) {
      q = q.where('timestamp', '<=', new Date(endDate));
    }

    if (filter.childId) q = q.where('childId', '==', filter.childId);

    const querySnapshot = await q.get();
    const dailyData: Record<string, any> = {};

    // Pre-fetch child information for all logs if we need to filter by class/center
    const childIds = new Set<string>();
    const logs: DailyLog[] = [];

    querySnapshot.forEach((doc) => {
      const log = doc.data() as DailyLog;
      logs.push(log);
      if (filter.classId || filter.centerId) {
        childIds.add(log.childId);
      }
    });

    // Get child information if needed for filtering
    const childInfoMap: Record<
      string,
      { classId?: string; centerId?: string }
    > = {};
    if (childIds.size > 0) {
      const childDocs = await this.childService.find({
        where: {
          field: 'id',
          operator: 'in',
          value: Array.from(childIds),
        },
      });

      for (const childInfo of childDocs) {
        if (!childInfo || !childInfo.id) {
          throw new Error('Child not found');
        }
        childInfoMap[childInfo.id] = childInfo;
      }
    }

    // Process each log
    for (const log of logs) {
      // Apply class/center filters
      if (filter.classId || filter.centerId) {
        const childInfo = childInfoMap[log.childId] || {};
        if (filter.classId && childInfo.classId !== filter.classId)
          continue;
        if (filter.centerId && childInfo.centerId !== filter.centerId)
          continue;
      }

      const dateStr = log.timestamp.toDate().toDateString();

      if (!dailyData[dateStr]) {
        dailyData[dateStr] = {
          napDurations: [],
          napCount: 0,
          mealStatusCounts: {},
          mealCount: 0,
          moodCounts: {},
          moodCount: 0,
          activityCounts: {},
          activityCount: 0,
          otherTypeCounts: {},
        };
      }

      switch (log.type) {
        case DailyLogEnum.Nap:
          if (log.details?.sleepDuration !== undefined) {
            dailyData[dateStr].napDurations.push(
              log.details.sleepDuration,
            );
            dailyData[dateStr].napCount++;
          }
          break;

        case DailyLogEnum.Meal:
          dailyData[dateStr].mealCount++;
          if (log.details?.mealStatus) {
            const mealStatus = log.details.mealStatus;
            dailyData[dateStr].mealStatusCounts[mealStatus] =
              (dailyData[dateStr].mealStatusCounts[mealStatus] || 0) +
              1;
          }
          break;

        case DailyLogEnum.Mood:
          dailyData[dateStr].moodCount++;
          if (log.details?.mood) {
            const mood = log.details.mood;
            dailyData[dateStr].moodCounts[mood] =
              (dailyData[dateStr].moodCounts[mood] || 0) + 1;
          }
          break;

        case DailyLogEnum.GeneralActivity:
          dailyData[dateStr].activityCount++;
          if (log.details?.activityEngagementLevel) {
            const engagement = log.details.activityEngagementLevel;
            dailyData[dateStr].activityCounts[engagement] =
              (dailyData[dateStr].activityCounts[engagement] || 0) +
              1;
          }
          break;

        default:
          dailyData[dateStr].otherTypeCounts[log.type] =
            (dailyData[dateStr].otherTypeCounts[log.type] || 0) + 1;
          break;
      }
    }

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      averageNapDuration:
        data.napDurations.length > 0
          ? data.napDurations.reduce(
              (sum: number, duration: number) => sum + duration,
              0,
            ) / data.napDurations.length
          : 0,
      napCount: data.napCount,
      mealStatusCounts: data.mealStatusCounts,
      totalMeals: data.mealCount,
      moodCounts: data.moodCounts,
      totalMoods: data.moodCount,
      otherTypeCounts: data.otherTypeCounts,
    }));
  }

  // Staff Performance Analysis Report
  async staffPerformanceReport(
    startDate?: string,
    endDate?: string,
    centerId?: string,
  ): Promise<StaffPerformance[]> {
    let q: FirebaseFirestore.Query = this.dailyLogsRef;
    q = q.orderBy('staffId');

    if (startDate) {
      q = q.where('timestamp', '>=', new Date(startDate));
    }

    if (endDate) {
      q = q.where('timestamp', '<=', new Date(endDate));
    }

    const querySnapshot = await q.get();
    const staffData: Record<string, StaffPerformance> = {};

    // If filtering by center, we need to check each log's child center
    if (centerId) {
      // Collect all childIds from logs with staffId
      const childIds = new Set<string>();
      for (const doc of querySnapshot.docs) {
        const log = doc.data() as DailyLog;
        if (log.staffId) {
          childIds.add(log.childId);
        }
      }

      // Batch fetch all child info
      const childInfoMap: Record<string, { centerId?: string }> = {};
      if (childIds.size > 0) {
        const childDocs = await this.childService.find({
          where: {
            field: 'id',
            operator: 'in',
            value: Array.from(childIds),
          },
        });

        for (const childInfo of childDocs) {
          if (!childInfo || !childInfo.id) {
            throw new Error('Child not found');
          }
          childInfoMap[childInfo.id] = childInfo;
        }
      }

      for (const doc of querySnapshot.docs) {
        const log = doc.data() as DailyLog;
        if (!log.staffId) continue;

        const childInfo = childInfoMap[log.childId];
        if (childInfo && childInfo.centerId === centerId) {
          if (!staffData[log.staffId]) {
            staffData[log.staffId] = {
              staffId: log.staffId,
              totalLogs: 0,
              logsByType: {},
            };
          }
          staffData[log.staffId].totalLogs++;
          staffData[log.staffId].logsByType[log.type] =
            (staffData[log.staffId].logsByType[log.type] || 0) + 1;
        }
      }
    } else {
      querySnapshot.forEach((doc) => {
        const log = doc.data() as DailyLog;
        if (!log.staffId) return;

        if (!staffData[log.staffId]) {
          staffData[log.staffId] = {
            staffId: log.staffId,
            totalLogs: 0,
            logsByType: {},
          };
        }
        staffData[log.staffId].totalLogs++;
        staffData[log.staffId].logsByType[log.type] =
          (staffData[log.staffId].logsByType[log.type] || 0) + 1;
      });
    }

    return Object.values(staffData);
  }

  // Comparative Report across classes or children
  async comparativeReport(
    groupBy: 'classId' | 'childId',
    startDate?: string,
    endDate?: string,
    centerId?: string,
  ): Promise<ComparativeData[]> {
    let q: FirebaseFirestore.Query = this.dailyLogsRef;

    if (startDate) {
      q = q.where('timestamp', '>=', new Date(startDate));
    }

    if (endDate) {
      q = q.where('timestamp', '<=', new Date(endDate));
    }

    const querySnapshot = await q.get();
    const groupData: Record<string, any> = {};

    // Pre-fetch child information for all logs
    const childIds = new Set<string>();
    const logs: DailyLog[] = [];

    querySnapshot.forEach((doc) => {
      const log = doc.data() as DailyLog;
      logs.push(log);
      childIds.add(log.childId);
    });

    // Batch fetch all child info to avoid N + 1 queries
    const childInfoMap: Record<
      string,
      { classId?: string; centerId?: string }
    > = {};
    if (childIds.size > 0) {
      const childDocs = await this.childService.find({
        where: {
          field: 'id',
          operator: 'in',
          value: Array.from(childIds),
        },
      });

      for (const childInfo of childDocs) {
        if (!childInfo || !childInfo.id) {
          throw new Error('Child not found');
        }
        childInfoMap[childInfo.id] = childInfo;
      }
    }

    // Process each log
    for (const log of logs) {
      const childInfo = childInfoMap[log.childId] || {};

      // Apply center filter
      if (centerId && childInfo.centerId !== centerId) continue;

      let groupKey: string;
      if (groupBy === 'classId') {
        groupKey = childInfo.classId || 'unknown';
      } else {
        groupKey = log.childId;
      }

      if (!groupData[groupKey]) {
        groupData[groupKey] = {
          data: {
            group: groupKey,
            totalLogs: 0,
            mealStatuses: {},
            engagementLevels: {},
            moodCounts: {},
            mealCount: 0,
            napCount: 0,
          },
          sleepDurations: [],
        };
      }

      const { data, sleepDurations } = groupData[groupKey];
      data.totalLogs++;

      switch (log.type) {
        case 'Meal':
          data.mealCount++;
          if (log.details?.mealStatus) {
            data.mealStatuses[log.details.mealStatus] =
              (data.mealStatuses[log.details.mealStatus] || 0) + 1;
          }
          break;

        case 'Nap':
          data.napCount++;
          if (log.details?.sleepDuration !== undefined) {
            sleepDurations.push(log.details.sleepDuration);
          }
          break;

        case 'General Activity':
          if (log.details?.activityEngagementLevel) {
            data.engagementLevels[
              log.details.activityEngagementLevel
            ] =
              (data.engagementLevels[
                log.details.activityEngagementLevel
              ] || 0) + 1;
          }
          break;

        case 'Mood':
          if (log.details?.mood) {
            data.moodCounts[log.details.mood] =
              (data.moodCounts[log.details.mood] || 0) + 1;
          }
          break;
      }
    }

    return Object.values(groupData).map(
      ({ data, sleepDurations }) => ({
        ...data,
        averageSleepDuration:
          sleepDurations.length > 0
            ? sleepDurations.reduce(
                (sum: number, duration: number) => sum + duration,
                0,
              ) / sleepDurations.length
            : undefined,
      }),
    );
  }
}
