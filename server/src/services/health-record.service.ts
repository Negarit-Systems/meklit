import { HealthRecordEntry } from '../models/health-record.model.js';
import { EntityCrudService } from './entity-crud.service.js';

export class HealthRecordService extends EntityCrudService<HealthRecordEntry> {
  constructor() {
    super('healthRecordEntries');
  }
}
