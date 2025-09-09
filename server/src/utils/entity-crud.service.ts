import { db } from '../config/firebase.js';
import { CollectionReference, Query } from 'firebase-admin/firestore';

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

  async find(filters?: Partial<T>, limit: number = 10): Promise<T[]> {
    let query: Query = this.collection;
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.where(key, '==', value);
      });
    }
    query = query.limit(limit);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
  }
}
