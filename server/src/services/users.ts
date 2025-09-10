import { Users } from '../models/users.js';
import { EntityCrudService } from './entity-crud.js';

export class UsersService extends EntityCrudService<Users> {
  constructor() {
    super('users');
  }
}
