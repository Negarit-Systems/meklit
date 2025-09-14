import { CollectionReference } from 'firebase-admin/firestore';
import {
  HealthRecordEntry,
  HealthRecordEnum,
} from '../models/health-record.js';
import { EntityCrudService } from './entity-crud.js';
import { db } from '../config/firebase.js';
import { ChildService } from './child-service.js';
import {
  ChildHealthProfile,
  IncidentFrequencyData,
  StaffAnalysis,
  TimelineEvent,
} from '../types/report-response.js';

export class HealthRecordService extends EntityCrudService<HealthRecordEntry> {
  private healthRecordRef: CollectionReference;
  private childService: ChildService;

  constructor() {
    super('healthRecordEntries');
    this.healthRecordRef = db.collection('healthRecordEntries');
    this.childService = new ChildService();
  }

  // Incident Frequency Report
  async incidentFrequencyReport(
    startDate?: string,
    endDate?: string,
    centerId?: string,
  ): Promise<IncidentFrequencyData[]> {
    let q: FirebaseFirestore.Query = this.healthRecordRef;

    if (startDate) {
      q = q.where('timestamp', '>=', new Date(startDate));
    }

    if (endDate) {
      q = q.where('timestamp', '<=', new Date(endDate));
    }

    const querySnapshot = await q.get();
    const typeCounts: Record<string, number> = {};
    const incidentCounts: Record<string, number> = {};
    const medicationCounts: Record<string, number> = {};

    // If filtering by center, check each record's child center
    let childInfoMap: Record<string, { centerId?: string }> = {};
    if (centerId) {
      // Collect all childIds from the records
      const childIds = Array.from(
        new Set(
          querySnapshot.docs.map(
            (doc) => (doc.data() as HealthRecordEntry).childId,
          ),
        ),
      );

      // Batch fetch all child infos
      const childInfos = await this.childService.find({
        where: [{ field: 'id', operator: 'in', value: childIds }],
      });

      // Build a map for quick lookup
      for (const childInfo of childInfos) {
        if (childInfo && childInfo.id) {
          childInfoMap[childInfo.id] = childInfo;
        }
      }
    }

    for (const doc of querySnapshot.docs) {
      const record = doc.data() as HealthRecordEntry;
      let include = true;
      if (centerId) {
        const childInfo = childInfoMap[record.childId];
        include = childInfo && childInfo.centerId === centerId;
      }
      if (!include) continue;

      typeCounts[record.type] = (typeCounts[record.type] || 0) + 1;

      if (
        record.type === HealthRecordEnum.Incident &&
        record.details.incident
      ) {
        const incidentText = record.details.incident as string;
        incidentCounts[incidentText] =
          (incidentCounts[incidentText] || 0) + 1;
      }

      if (
        record.type === HealthRecordEnum.MedicationAdministered &&
        record.details.medication
      ) {
        const medicationText = record.details.medication as string;
        medicationCounts[medicationText] =
          (medicationCounts[medicationText] || 0) + 1;
      }
    }

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      incidents:
        type === HealthRecordEnum.Incident
          ? incidentCounts
          : undefined,
      medications:
        type === HealthRecordEnum.MedicationAdministered
          ? medicationCounts
          : undefined,
    }));
  }

  // Events Timeline Report
  async timelineReport(
    startDate?: string,
    endDate?: string,
    childId?: string,
    centerId?: string,
  ): Promise<TimelineEvent[]> {
    let q = this.healthRecordRef.orderBy('timestamp', 'asc');

    if (startDate) {
      q = q.where('timestamp', '>=', new Date(startDate));
    }

    if (endDate) {
      q = q.where('timestamp', '<=', new Date(endDate));
    }

    if (childId) q = q.where('childId', '==', childId);

    const querySnapshot = await q.get();
    const events: TimelineEvent[] = [];

    // If filtering by center, we need to check each record's child center
    if (centerId) {
      // Collect all childIds from the records
      const childIds = Array.from(
        new Set(
          querySnapshot.docs.map(
            (doc) => (doc.data() as HealthRecordEntry).childId,
          ),
        ),
      );

      // Batch fetch all child infos
      const childInfos = await this.childService.find({
        where: [{ field: 'id', operator: 'in', value: childIds }],
      });

      // Build a map for quick lookup
      const childInfoMap: Record<string, { centerId?: string }> = {};
      for (const childInfo of childInfos) {
        if (childInfo && childInfo.id) {
          childInfoMap[childInfo.id] = childInfo;
        }
      }

      for (const doc of querySnapshot.docs) {
        const record = doc.data() as HealthRecordEntry;
        const childInfo = childInfoMap[record.childId];
        if (childInfo && childInfo.centerId === centerId) {
          events.push({
            id: doc.id,
            childId: record.childId,
            timestamp: record.timestamp,
            type: record.type,
            incident: record.details.incident,
            medication: record.details.medication,
            actionTaken: record.actionTaken,
          });
        }
      }
    } else {
      querySnapshot.forEach((doc) => {
        const record = doc.data() as HealthRecordEntry;
        events.push({
          id: doc.id,
          childId: record.childId,
          timestamp: record.timestamp,
          type: record.type,
          incident: record.details.incident,
          medication: record.details.medication,
          actionTaken: record.actionTaken,
        });
      });
    }

    return events;
  }

  // Child Health Profile Report
  async childHealthProfile(
    childId: string,
    limit: number,
    startDate?: string,
    endDate?: string,
  ): Promise<ChildHealthProfile> {
    let q = this.healthRecordRef.where('childId', '==', childId);

    if (startDate) {
      q = q.where('timestamp', '>=', new Date(startDate));
    }

    if (endDate) {
      q = q.where('timestamp', '<=', new Date(endDate));
    }

    q = q.orderBy('timestamp', 'asc');
    q = q.limit(limit);

    const querySnapshot = await q.get();
    const profile: ChildHealthProfile = {
      childId,
      totalIncidents: 0,
      totalMedications: 0,
      incidentDistribution: {},
      medicationDistribution: {},
      actionDistribution: {},
      recentEntries: [],
    };

    querySnapshot.forEach((doc) => {
      const record = doc.data() as HealthRecordEntry;

      if (record.type === HealthRecordEnum.Incident) {
        profile.totalIncidents++;
        const incidentText = record.details.incident as string;
        profile.incidentDistribution[incidentText] =
          (profile.incidentDistribution[incidentText] || 0) + 1;
      }

      if (record.type === HealthRecordEnum.MedicationAdministered) {
        profile.totalMedications++;
        const medicationText = record.details.medication as string;
        profile.medicationDistribution[medicationText] =
          (profile.medicationDistribution[medicationText] || 0) + 1;
      }

      profile.actionDistribution[record.actionTaken] =
        (profile.actionDistribution[record.actionTaken] || 0) + 1;

      profile.recentEntries.push({
        id: doc.id,
        childId: record.childId,
        timestamp: record.timestamp,
        type: record.type,
        incident: record.details.incident,
        medication: record.details.medication,
        actionTaken: record.actionTaken,
      });
    });

    return profile;
  }

  // Staff/Recorder Analysis Report
  async staffAnalysisReport(
    startDate?: string,
    endDate?: string,
    centerId?: string,
  ): Promise<StaffAnalysis[]> {
    let q: FirebaseFirestore.Query = this.healthRecordRef;
    q = q.orderBy('recordedByUserId');

    if (startDate) {
      q = q.where('timestamp', '>=', new Date(startDate));
    }

    if (endDate) {
      q = q.where('timestamp', '<=', new Date(endDate));
    }

    const querySnapshot = await q.get();
    const staffData: Record<string, StaffAnalysis> = {};

    // If filtering by center, we check each record's child center
    if (centerId) {
      // Collect all childIds from the records
      const childIds = Array.from(
        new Set(
          querySnapshot.docs.map(
            (doc) => (doc.data() as HealthRecordEntry).childId,
          ),
        ),
      );

      // Batch fetch all child infos
      const childInfos = await this.childService.find({
        where: [{ field: 'id', operator: 'in', value: childIds }],
      });

      // Build a map for quick lookup
      const childInfoMap: Record<string, { centerId?: string }> = {};
      for (const childInfo of childInfos) {
        if (childInfo && childInfo.id) {
          childInfoMap[childInfo.id] = childInfo;
        }
      }

      for (const doc of querySnapshot.docs) {
        const record = doc.data() as HealthRecordEntry;
        const staffId = record.recordedByUserId;
        const childInfo = childInfoMap[record.childId];

        if (childInfo && childInfo.centerId === centerId) {
          if (!staffData[staffId]) {
            staffData[staffId] = {
              staffId,
              totalRecords: 0,
              incidentsReported: 0,
              medicationsReported: 0,
            };
          }

          staffData[staffId].totalRecords++;

          if (record.type === HealthRecordEnum.Incident) {
            staffData[staffId].incidentsReported++;
          }

          if (
            record.type === HealthRecordEnum.MedicationAdministered
          ) {
            staffData[staffId].medicationsReported++;
          }
        }
      }
    } else {
      querySnapshot.forEach((doc) => {
        const record = doc.data() as HealthRecordEntry;
        const staffId = record.recordedByUserId;

        if (!staffData[staffId]) {
          staffData[staffId] = {
            staffId,
            totalRecords: 0,
            incidentsReported: 0,
            medicationsReported: 0,
          };
        }

        staffData[staffId].totalRecords++;

        if (record.type === HealthRecordEnum.Incident) {
          staffData[staffId].incidentsReported++;
        }

        if (record.type === HealthRecordEnum.MedicationAdministered) {
          staffData[staffId].medicationsReported++;
        }
      });
    }

    return Object.values(staffData);
  }

  // Action Distribution Report
  async actionDistributionReport(
    startDate?: string,
    endDate?: string,
    centerId?: string,
  ): Promise<Record<string, number>> {
    let q: FirebaseFirestore.Query = this.healthRecordRef;

    if (startDate) {
      q = q.where('timestamp', '>=', new Date(startDate));
    }

    if (endDate) {
      q = q.where('timestamp', '<=', new Date(endDate));
    }

    const querySnapshot = await q.get();
    const actionCounts: Record<string, number> = {};

    // If filtering by center, check each record's child center
    if (centerId) {
      // Collect all childIds from the records
      const childIds = Array.from(
        new Set(
          querySnapshot.docs.map(
            (doc) => (doc.data() as HealthRecordEntry).childId,
          ),
        ),
      );

      // Batch fetch all child infos
      const childInfos = await this.childService.find({
        where: [{ field: 'id', operator: 'in', value: childIds }],
      });

      // Build a map for quick lookup
      const childInfoMap: Record<string, { centerId?: string }> = {};
      for (const childInfo of childInfos) {
        if (childInfo && childInfo.id) {
          childInfoMap[childInfo.id] = childInfo;
        }
      }

      for (const doc of querySnapshot.docs) {
        const record = doc.data() as HealthRecordEntry;
        const childInfo = childInfoMap[record.childId];
        if (childInfo && childInfo.centerId === centerId) {
          actionCounts[record.actionTaken] =
            (actionCounts[record.actionTaken] || 0) + 1;
        }
      }
    } else {
      querySnapshot.forEach((doc) => {
        const record = doc.data() as HealthRecordEntry;
        actionCounts[record.actionTaken] =
          (actionCounts[record.actionTaken] || 0) + 1;
      });
    }

    return actionCounts;
  }
}
