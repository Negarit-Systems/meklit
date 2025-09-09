import { db } from '../config/firebase.js';
import { CollectionReference, Query } from 'firebase-admin/firestore';
import { QueryOptions } from '../types/query-option.js';

export class EntityCrudService<T extends { id?: string }> {
  protected collection: CollectionReference;

  constructor(collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  async create(data: T): Promise<T> {
    const docRef = await this.collection.add(data);
    const createdDoc = await docRef.get();
    return { id: createdDoc.id, ...createdDoc.data() } as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const docRef = this.collection.doc(id);
    await docRef.update(data);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as T;
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  async findOne(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  async find(queryOptions?: QueryOptions): Promise<T[]> {
    let query: Query = this.collection;

    // Handle WHERE conditions
    if (queryOptions?.where) {
      const whereConditions = Array.isArray(queryOptions.where)
        ? queryOptions.where
        : [queryOptions.where];

      for (const condition of whereConditions) {
        query = query.where(condition.field, condition.operator, condition.value);
      }
    }

    // Handle ORDER BY conditions
    if (queryOptions?.orderBy) {
      const orderByConditions = Array.isArray(queryOptions.orderBy)
        ? queryOptions.orderBy
        : [queryOptions.orderBy];

      for (const condition of orderByConditions) {
        query = query.orderBy(condition.field, condition.direction);
      }
    }

    // Handle LIMIT
    if (queryOptions?.limit) {
      query = query.limit(queryOptions.limit);
    }

    // Handle pagination (startAfter)
    if (queryOptions?.startAfter) {
      query = query.startAfter(queryOptions.startAfter);
    }

    // Handle pagination (endBefore)
    if (queryOptions?.endBefore) {
      query = query.endBefore(queryOptions.endBefore);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
  }
}
