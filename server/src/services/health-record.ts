import { HealthRecordEntry } from '../models/health-record.js';
import { EntityCrudService } from './entity-crud.js';

export class HealthRecordService extends EntityCrudService<HealthRecordEntry> {
  constructor() {
    super('healthRecordEntries');
  }
}
