import { CollectionReference } from 'firebase-admin/firestore';
import { DailyLog } from '../models/daily-log.js';
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
  private childService = new ChildService();

  constructor() {
    super('dailyLogEntries');
    this.dailyLogsRef = db.collection('dailyLogEntries');
  }

  // Activity Frequency Report
  async activityFrequencyReport(
    startDate: string,
    endDate: string,
    filter: { childId?: string; classId?: string } = {},
  ): Promise<Record<string, number>> {
    let q = this.dailyLogsRef
      .where('timestamp', '>=', new Date(startDate as string))
      .where('timestamp', '<=', new Date(endDate as string));

    if (filter.childId) q = q.where('childId', '==', filter.childId);

    const querySnapshot = await q.get();
    const counts: Record<string, number> = {};

    // If filtering by classId, we need to check each log's child class
    if (filter.classId) {
      for (const doc of querySnapshot.docs) {
        const log = doc.data() as DailyLog;
        const childInfo = await this.childService.findOne(
          log.childId,
        );

        if (!childInfo) {
          throw new Error('Child not found');
        }

        if (childInfo.classId === filter.classId) {
          counts[log.type] = (counts[log.type] || 0) + 1;
        }
      }
    } else {
      querySnapshot.forEach((doc) => {
        const log = doc.data() as DailyLog;
        counts[log.type] = (counts[log.type] || 0) + 1;
      });
    }

    return counts;
  }

  // Trend Over Time Report
  async trendOverTimeReport(
    startDate: string,
    endDate: string,
    filter: {
      childId?: string;
      classId?: string;
      centerId?: string;
    } = {},
  ): Promise<TrendData[]> {
    let q = this.dailyLogsRef
      .where('timestamp', '>=', new Date(startDate as string))
      .where('timestamp', '<=', new Date(endDate as string));

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
      await Promise.all(
        Array.from(childIds).map(async (childId) => {
          const childInfo = await this.childService.findOne(childId);

          if (!childInfo) {
            throw new Error('Child not found');
          }

          childInfoMap[childId] = childInfo;
        }),
      );
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

      const dateStr = log.timestamp.toISOString().split('T')[0];

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
        case 'Nap':
          if (log.details?.sleepDuration !== undefined) {
            dailyData[dateStr].napDurations.push(
              log.details.sleepDuration,
            );
            dailyData[dateStr].napCount++;
          }
          break;

        case 'Meal':
          dailyData[dateStr].mealCount++;
          if (log.details?.mealStatus) {
            const mealStatus = log.details.mealStatus;
            dailyData[dateStr].mealStatusCounts[mealStatus] =
              (dailyData[dateStr].mealStatusCounts[mealStatus] || 0) +
              1;
          }
          break;

        case 'Mood':
          dailyData[dateStr].moodCount++;
          if (log.details?.mood) {
            const mood = log.details.mood;
            dailyData[dateStr].moodCounts[mood] =
              (dailyData[dateStr].moodCounts[mood] || 0) + 1;
          }
          break;

        case 'General Activity':
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
    startDate: string,
    endDate: string,
    centerId?: string,
  ): Promise<StaffPerformance[]> {
    let q = this.dailyLogsRef
      .where('timestamp', '>=', new Date(startDate as string))
      .where('timestamp', '<=', new Date(endDate as string));

    const querySnapshot = await q.get();
    const staffData: Record<string, StaffPerformance> = {};

    // If filtering by center, we need to check each log's child center
    if (centerId) {
      const childInfoMap: Record<string, { centerId?: string }> = {};

      for (const doc of querySnapshot.docs) {
        const log = doc.data() as DailyLog;
        if (!log.staffId) continue;

        // Get child info if not already cached
        if (!childInfoMap[log.childId]) {
          const childInfo = await this.childService.findOne(
            log.childId,
          );

          if (!childInfo) {
            throw new Error('Child not found');
          }

          childInfoMap[log.childId] = childInfo;
        }

        const childInfo = childInfoMap[log.childId];
        if (childInfo.centerId === centerId) {
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
    startDate: string,
    endDate: string,
    groupBy: 'classId' | 'childId',
    centerId?: string,
  ): Promise<ComparativeData[]> {
    let q = this.dailyLogsRef
      .where('timestamp', '>=', new Date(startDate as string))
      .where('timestamp', '<=', new Date(endDate as string));

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

    const childInfoMap: Record<
      string,
      { classId?: string; centerId?: string }
    > = {};
    await Promise.all(
      Array.from(childIds).map(async (childId) => {
        const childInfo = await this.childService.findOne(childId);

        if (!childInfo) {
          throw new Error('Child not found');
        }

        childInfoMap[childId] = childInfo;
      }),
    );

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
