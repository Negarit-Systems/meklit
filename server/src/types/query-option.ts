import { OrderByDirection, WhereFilterOp } from 'firebase-admin/firestore';

export type WhereCondition = {
  field: string;
  operator: WhereFilterOp;
  value: unknown;
};

export type OrderByCondition = {
  field: string;
  direction?: OrderByDirection;
};

export type QueryOptions = {
  where?: WhereCondition | WhereCondition[];
  orderBy?: OrderByCondition | OrderByCondition[];
  limit?: number;
  startAfter?: unknown;
};
