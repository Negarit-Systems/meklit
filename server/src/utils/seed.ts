import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../config/firebase.js';
import { Child } from '../models/child.js';
import { DailyLog, DailyLogEnum } from '../models/daily-log.js';
import {
  HealthRecordEntry,
  HealthRecordEnum,
} from '../models/health-record.js';

const N_CHILDREN = 15;
const N_DAILY_LOGS = 100;
const N_HEALTH_RECORDS = 100;

// Variables defined at the top
const firstNames = [
  'Meklit',
  'Abel',
  'Selam',
  'Samuel',
  'Betelhem',
  'Yonas',
  'Hanna',
  'Dawit',
  'Liya',
  'Marta',
  'Robel',
  'Sofia',
  'Nahom',
  'Mahi',
  'Kidus',
];
const lastNames = [
  'Teshome',
  'Gebre',
  'Alemu',
  'Kebede',
  'Mengistu',
  'Tesfaye',
  'Wolde',
  'Bekele',
  'Haile',
  'Demissie',
  'Fikadu',
  'Abebe',
  'Mulugeta',
  'Yilma',
  'Girma',
];
const centerIds = ['Center 1', 'Center 2', 'Center 3', 'Center 4'];
const classIds = [
  'Class A',
  'Class B',
  'Class C',
  'Class D',
  'Class E',
  'Class F',
  'Class G',
  'Class H',
];

const staff = [
  'Amanuel Bekele',
  'Sofia Teshome',
  'Robel Yilma',
  'Hanna Fikadu',
  'Dawit Abebe',
  'Liya Mengistu',
  'Samuel Girma',
  'Betelhem Alemu',
  'Yonas Tesfaye',
  'Marta Wolde',
  'Kidus Demissie',
  'Selam Mulat',
];

const mealStatuses = ['Ate all', 'Ate half', 'Ate little', 'Refused'];
const sleepDurations = [30, 45, 60, 90, 120];
const engagementLevels = ['High', 'Moderate', 'Low'];
const moods = [
  'Happy',
  'Energetic',
  'Sad',
  'Cranky',
  'Calm',
  'Excited',
  'Sleepy',
  'Mad',
];

const incidents = [
  'Scraped knee',
  'Bumped head',
  'Minor cut',
  'Allergic reaction',
  'Fell while playing',
  'Insect bite',
];

const medications = [
  'Ibuprofen',
  'Antibiotic',
  'Tylenol',
  'Antihistamine',
  'Cough syrup',
  'Topical cream',
  'Eye drops',
  'Nasal spray',
  'Paracetamol',
  'Hydrocortisone',
];

const actions = [
  'Applied bandage',
  'Monitored for 30min',
  'Called parent',
  'Rest',
  'Administered medication',
  'Cleaned wound',
  'Observed for allergic reaction',
  'Provided ice pack',
];

async function seedChildren() {
  const collection = db.collection('children');
  const children: Omit<Child, 'id'>[] = [];
  for (let i = 0; i < N_CHILDREN; i++) {
    const birthYear = 2020 + Math.floor(Math.random() * 3);
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
  console.log(`Seeded ${N_CHILDREN} Child entries`);
  return childIds;
}

async function seedDailyLogs(childIds: string[]) {
  const collection = db.collection('dailyLogEntries');
  for (let i = 0; i < N_DAILY_LOGS; i++) {
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
  console.log(`Seeded ${N_DAILY_LOGS} DailyLogEntries`);
}

async function seedHealthRecords(childIds: string[]) {
  const collection = db.collection('healthRecordEntries');
  for (let i = 0; i < N_HEALTH_RECORDS; i++) {
    const type =
      Object.values(HealthRecordEnum)[
        Math.floor(
          Math.random() * Object.values(HealthRecordEnum).length,
        )
      ];
    const entry: Omit<HealthRecordEntry, 'id'> = {
      childId: childIds[Math.floor(Math.random() * childIds.length)],
      recordedByUserId:
        staff[Math.floor(Math.random() * staff.length)],
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
  console.log(`Seeded ${N_HEALTH_RECORDS} HealthRecordEntries`);
}

async function isCollectionEmpty(collectionName: string) {
  const snapshot = await db.collection(collectionName).limit(1).get();
  return snapshot.empty;
}

async function seed() {
  let childIds: string[] = [];

  childIds = await seedChildren();
  await seedDailyLogs(childIds);
  await seedHealthRecords(childIds);
}

seed().catch(console.error);
