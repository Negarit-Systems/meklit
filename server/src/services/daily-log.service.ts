import { DailyLog } from '../models/daily-log.model.js';
import { EntityCrudService } from './entity-crud.service.js';

export class DailyLogService extends EntityCrudService<DailyLog> {
  constructor() {
    super('dailyLogEntries');
  }
}
