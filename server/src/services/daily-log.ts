import { DailyLog } from '../models/daily-log.js';
import { EntityCrudService } from './entity-crud.js';

export class DailyLogService extends EntityCrudService<DailyLog> {
  constructor() {
    super('dailyLogEntries');
  }
}
