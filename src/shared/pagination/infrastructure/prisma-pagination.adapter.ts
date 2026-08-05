/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  PaginationParams,
  PaginatedResult,
  PaginateOptions,
  FilterOperator,
} from '../domain/pagination.interfaces';

export class PrismaPaginationAdapter {
  static buildQuery<T>(
    params: PaginationParams<T>,
    config: PaginateOptions<T> = {},
  ): {
    where: any;
    orderBy: any;
    skip: number;
    take: number;
  } {
    const where = this.buildWhereClause(params, config);
    const orderBy = this.buildOrderByClause(params.sorts);
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    return { where, orderBy, skip, take };
  }

  private static buildWhereClause<T>(
    params: PaginationParams<T>,
    config: PaginateOptions<T>,
  ): any {
    const andClauses: any[] = [];

    // Add filter clauses
    for (const filter of params.filters) {
      andClauses.push(
        this.buildFilterClause(
          filter.field as string,
          filter.operator,
          filter.value,
        ),
      );
    }

    // Add search clause
    if (
      params.search &&
      config.searchableFields &&
      config.searchableFields.length > 0
    ) {
      const searchClauses = config.searchableFields.map((field) =>
        this.buildSearchFieldClause(field as string, params.search!),
      );
      andClauses.push({ OR: searchClauses });
    }

    return andClauses.length > 0 ? { AND: andClauses } : {};
  }

  private static buildFilterClause(
    field: string,
    operator: FilterOperator,
    value: any,
  ): any {
    const mappedValue = this.mapOperator(operator, value);

    if (field.includes('.')) {
      return this.buildNestedFieldObject(field, mappedValue);
    }

    return { [field]: mappedValue };
  }

  private static buildSearchFieldClause(
    field: string,
    searchTerm: string,
  ): any {
    const valueClause = { contains: searchTerm, mode: 'insensitive' };

    if (field.includes('.')) {
      return this.buildNestedFieldObject(field, valueClause);
    }

    return { [field]: valueClause };
  }

  private static buildNestedFieldObject(fieldPath: string, value: any): any {
    const parts = fieldPath.split('.');
    const result: any = {};
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      current[part] = {};
      current = current[part];
    }

    const lastField = parts[parts.length - 1];
    current[lastField] = value;

    return result;
  }

  private static buildOrderByClause<T>(
    sorts: PaginationParams<T>['sorts'],
  ): any[] | undefined {
    if (!sorts || sorts.length === 0) {
      return undefined;
    }

    return sorts.map((sort) => {
      const fieldStr = sort.field as string;
      if (fieldStr.includes('.')) {
        return this.buildNestedFieldObject(fieldStr, sort.order);
      }
      return { [fieldStr]: sort.order };
    });
  }

  private static mapOperator(operator: FilterOperator, value: any): any {
    switch (operator) {
      case FilterOperator.EQ:
        return value;
      case FilterOperator.NEQ:
        return { not: value };
      case FilterOperator.GT:
        return { gt: value };
      case FilterOperator.GTE:
        return { gte: value };
      case FilterOperator.LT:
        return { lt: value };
      case FilterOperator.LTE:
        return { lte: value };
      case FilterOperator.CONTAINS:
        return { contains: value, mode: 'insensitive' };
      case FilterOperator.STARTS_WITH:
        return { startsWith: value, mode: 'insensitive' };
      case FilterOperator.ENDS_WITH:
        return { endsWith: value, mode: 'insensitive' };
      case FilterOperator.IN:
        return { in: value };
      case FilterOperator.NOT_IN:
        return { notIn: value };
      default:
        return value;
    }
  }

  static toResult<T>(
    items: T[],
    total: number,
    params: PaginationParams<any>,
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / params.limit);
    return {
      items,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  static async paginate<T>(
    modelDelegate: {
      findMany: (options?: any) => Promise<any>;
      count: (options?: any) => Promise<any>;
    },
    params: PaginationParams<T>,
    options: PaginateOptions<T> = {},
  ): Promise<PaginatedResult<T>> {
    const queryOptions = this.buildQuery(params, options);
    const findOptions: any = { ...queryOptions };

    if (options.select) findOptions.select = options.select;
    if (options.include) findOptions.include = options.include;

    const [items, total] = await Promise.all([
      modelDelegate.findMany(findOptions),
      modelDelegate.count({ where: queryOptions.where }),
    ]);

    return this.toResult(items, total, params);
  }
}
