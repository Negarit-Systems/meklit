import { Child } from '../models/child.js';
import { EntityCrudService } from './entity-crud.js';

export class ChildService extends EntityCrudService<Child> {
  constructor() {
    super('children');
  }
}
