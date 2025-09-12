import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { Child } from '../models/child.js';
import { DailyLog, DailyLogEnum } from '../models/daily-log.js';
import {
  HealthRecordEntry,
  HealthRecordEnum,
} from '../models/health-record.js';

async function seedChildren() {
  const collection = db.collection('children');
  const firstNames = [
    'Meklit',
    'Abel',
    'Selam',
    'Samuel',
    'Betelhem',
    'Yonas',
    'Hanna',
    'Dawit',
  ];
  const lastNames = [
    'Teshome',
    'Gebre',
    'Alemu',
    'Kebede',
    'Mengistu',
  ];
  const centerIds = ['center1', 'center2'];
  const classIds = ['classA', 'classB', 'classC'];

  const children: Omit<Child, 'id'>[] = [];
  for (let i = 0; i < 8; i++) {
    const birthYear = 2020 + Math.floor(Math.random() * 3); // Kids born 2020-2022
    const birthDate = new Date(
      birthYear,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28),
    );
    children.push({
      firstName:
        firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName:
        lastNames[Math.floor(Math.random() * lastNames.length)],
      dateOfBirth: birthDate,
      centerId:
        centerIds[Math.floor(Math.random() * centerIds.length)],
      classId: classIds[Math.floor(Math.random() * classIds.length)],
    });
  }

  const childIds: string[] = [];
  for (const child of children) {
    const docRef = await collection.add(child);
    childIds.push(docRef.id);
  }
  console.log('Seeded 8 Child entries');
  return childIds;
}

async function seedDailyLogs(childIds: string[]) {
  const collection = db.collection('dailyLogEntries');
  const staff = ['staff1', 'staff2', 'staff3'];
  const mealStatuses = [
    'Ate all',
    'Ate half',
    'Refused',
    'Ate little',
  ];
  const sleepDurations = [30, 45, 60, 90, 120]; // Minutes
  const engagementLevels = ['High', 'Moderate', 'Low'];
  const moods = ['Happy', 'Cranky', 'Calm', 'Excited'];

  for (let i = 0; i < 50; i++) {
    const type =
      Object.values(DailyLogEnum)[
        Math.floor(Math.random() * Object.values(DailyLogEnum).length)
      ];
    const entry: Omit<DailyLog, 'id'> = {
      childId: childIds[Math.floor(Math.random() * childIds.length)],
      staffId: staff[Math.floor(Math.random() * staff.length)],
      timestamp: Timestamp.fromDate(
        new Date(
          Date.now() -
            Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
        ),
      ),
      type,
      details: {},
    };

    switch (type) {
      case DailyLogEnum.Meal:
        entry.details.mealStatus =
          mealStatuses[
            Math.floor(Math.random() * mealStatuses.length)
          ];
        entry.details.other = `Meal type: ${['Pasta', 'Fruit', 'Sandwich', 'Yogurt'][Math.floor(Math.random() * 4)]}`;
        break;
      case DailyLogEnum.Nap:
        entry.details.sleepDuration =
          sleepDurations[
            Math.floor(Math.random() * sleepDurations.length)
          ];
        break;
      case DailyLogEnum.Diaper:
        entry.details.other = `Diaper: ${['Wet', 'Dirty', 'Both'][Math.floor(Math.random() * 3)]}`;
        break;
      case DailyLogEnum.Mood:
        entry.details.mood =
          moods[Math.floor(Math.random() * moods.length)];
        break;
      case DailyLogEnum.GeneralActivity:
        entry.details.activityEngagementLevel =
          engagementLevels[
            Math.floor(Math.random() * engagementLevels.length)
          ];
        entry.details.other = `Activity: ${['Painting', 'Blocks', 'Outdoor play', 'Story time'][Math.floor(Math.random() * 4)]}`;
        break;
    }

    await collection.add(entry);
  }
  console.log('Seeded 50 DailyLogEntries');
}

async function seedHealthRecords(childIds: string[]) {
  const collection = db.collection('healthRecordEntries');
  const users = ['user1', 'user2', 'user3'];
  const incidents = [
    'Scraped knee',
    'Bumped head',
    'Minor cut',
    'Allergic reaction',
  ];
  const medications = [
    'Ibuprofen',
    'Antibiotic',
    'Tylenol',
    'Antihistamine',
  ];
  const actions = [
    'Applied bandage',
    'Monitored for 30min',
    'Called parent',
    'Rest',
  ];

  for (let i = 0; i < 30; i++) {
    const type =
      Object.values(HealthRecordEnum)[
        Math.floor(
          Math.random() * Object.values(HealthRecordEnum).length,
        )
      ];
    const entry: Omit<HealthRecordEntry, 'id'> = {
      childId: childIds[Math.floor(Math.random() * childIds.length)],
      recordedByUserId:
        users[Math.floor(Math.random() * users.length)],
      timestamp: new Date(
        Date.now() -
          Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      ),
      type,
      details: {},
      actionTaken:
        actions[Math.floor(Math.random() * actions.length)],
    };

    switch (type) {
      case HealthRecordEnum.Incident:
        entry.details.incident =
          incidents[Math.floor(Math.random() * incidents.length)];
        entry.details.other = 'Minor injury during play';
        break;
      case HealthRecordEnum.MedicationAdministered:
        entry.details.medication =
          medications[Math.floor(Math.random() * medications.length)];
        entry.details.other = `Dosage: ${['5ml', '10ml', '1 tablet'][Math.floor(Math.random() * 3)]}`;
        break;
    }

    await collection.add(entry);
  }
  console.log('Seeded 30 HealthRecordEntries');
}

async function isCollectionEmpty(collectionName: string) {
  const snapshot = await db.collection(collectionName).limit(1).get();
  return snapshot.empty;
}

async function seed() {
  const childrenEmpty = await isCollectionEmpty('children');
  const dailyLogsEmpty = await isCollectionEmpty('dailyLogEntries');
  const healthRecordsEmpty = await isCollectionEmpty(
    'healthRecordEntries',
  );

  let childIds: string[] = [];

  if (childrenEmpty) {
    childIds = await seedChildren();
  } else {
    console.log('Children already seeded, skipping...');
    // fetch childIds if you still need them for logs/records
    const snapshot = await db.collection('children').get();
    childIds = snapshot.docs.map((doc) => doc.id);
  }

  if (dailyLogsEmpty) {
    await seedDailyLogs(childIds);
  } else {
    console.log('Daily logs already seeded, skipping...');
  }

  if (healthRecordsEmpty) {
    await seedHealthRecords(childIds);
  } else {
    console.log('Health records already seeded, skipping...');
  }
}

seed().catch(console.error);
