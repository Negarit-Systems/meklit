import { DailyLog } from '../models/daily-log.model.js';
import { EntityCrudService } from '../utils/entity-crud.service.js';

export class DailyLogService extends EntityCrudService<DailyLog> {
  constructor() {
    super('dailyLogEntries');
  }
}
