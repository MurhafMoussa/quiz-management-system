export enum FilterOperator {
  EQ = 'eq',
  NEQ = 'neq',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  IN = 'in',
  NOT_IN = 'notIn',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface FilterRule<T = any> {
  field: keyof T | string;
  operator: FilterOperator;
  value: any;
}

export interface SortRule<T = any> {
  field: keyof T | string;
  order: SortOrder;
}

export interface PaginationParams<T = any> {
  page: number;
  limit: number;
  search?: string;
  filters: FilterRule<T>[];
  sorts: SortRule<T>[];
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginationConfig<T = any> {
  searchableFields?: (keyof T | string)[];
  filterableFields?: (keyof T | string)[];
  sortableFields?: (keyof T | string)[];
  defaultSort?: {
    field: keyof T | string;
    order: SortOrder;
  };
  maxLimit?: number;
}

export interface PaginateOptions<T> extends PaginationConfig<T> {
  select?: any;
  include?: any;
}
