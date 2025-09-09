import { OrderByDirection, WhereFilterOp } from 'firebase-admin/firestore';

export type WhereCondition = {
  field: string;
  operator: WhereFilterOp;
  value: any;
};

export type OrderByCondition = {
  field: string;
  direction?: OrderByDirection;
};

export interface QueryOptions {
  where?: WhereCondition | WhereCondition[];
  orderBy?: OrderByCondition | OrderByCondition[];
  limit?: number;
  startAfter?: any;
  endBefore?: any;
}
