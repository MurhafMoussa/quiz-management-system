/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  PaginationConfig,
  PaginationParams,
  FilterRule,
  SortRule,
  FilterOperator,
  SortOrder,
} from '../domain/pagination.interfaces';

export class PaginationParser {
  private static readonly RESERVED_KEYS = [
    'page',
    'limit',
    'sortBy',
    'sortOrder',
    'search',
  ];
  private static readonly OPERATOR_REGEX =
    /^([a-zA-Z0-9_\-.]+)(\[([a-zA-Z0-9_]+)\])?$/;

  static parse<T = any>(
    query: Record<string, any>,
    config: PaginationConfig<T> = {},
  ): PaginationParams<T> {
    const { page, limit } = this.parsePageAndLimit(query, config);
    const search = this.parseSearch(query);
    const sorts = this.parseSorts(query, config);
    const filters = this.parseFilters(query, config);

    return { page, limit, search, filters, sorts };
  }

  private static parsePageAndLimit(
    query: Record<string, any>,
    config: PaginationConfig,
  ): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limitInput = parseInt(query.limit as string, 10) || 10;
    const maxLimit = config.maxLimit ?? 100;
    const limit = Math.max(1, Math.min(limitInput, maxLimit));

    return { page, limit };
  }

  private static parseSearch(query: Record<string, any>): string | undefined {
    return typeof query.search === 'string' && query.search.trim()
      ? query.search.trim()
      : undefined;
  }

  private static parseSorts<T>(
    query: Record<string, any>,
    config: PaginationConfig<T>,
  ): SortRule<T>[] {
    const sorts: SortRule<T>[] = [];
    const sortBy = query.sortBy as string;
    const sortOrder =
      (query.sortOrder as string)?.toLowerCase() === (SortOrder.ASC as string)
        ? SortOrder.ASC
        : SortOrder.DESC;

    const sortableFields = (config.sortableFields as string[]) || [];

    if (sortBy && (!config.sortableFields || sortableFields.includes(sortBy))) {
      sorts.push({ field: sortBy, order: sortOrder });
    } else if (config.defaultSort) {
      sorts.push({
        field: config.defaultSort.field,
        order: config.defaultSort.order,
      });
    }

    return sorts;
  }

  private static parseFilters<T>(
    query: Record<string, any>,
    config: PaginationConfig<T>,
  ): FilterRule<T>[] {
    const filters: FilterRule<T>[] = [];
    const filterableFields = (config.filterableFields as string[]) || [];

    for (const [key, rawValue] of Object.entries(query)) {
      if (this.shouldSkipKey(key, rawValue)) {
        continue;
      }

      const rule = this.parseFilterRule(key, rawValue, filterableFields);
      if (rule) {
        filters.push(rule);
      }
    }

    return filters;
  }

  private static shouldSkipKey(key: string, value: any): boolean {
    return (
      this.RESERVED_KEYS.includes(key) ||
      value === undefined ||
      value === null ||
      value === ''
    );
  }

  private static parseFilterRule<T>(
    key: string,
    rawValue: any,
    filterableFields: string[],
  ): FilterRule<T> | null {
    const match = key.match(this.OPERATOR_REGEX);
    if (!match) return null;

    const field = match[1];
    const operatorStr = match[3];

    if (!filterableFields.includes(field)) {
      return null;
    }

    const operator = this.parseOperator(operatorStr);
    const value = this.parseValue(rawValue, operator);

    return { field, operator, value };
  }

  private static parseOperator(operatorStr?: string): FilterOperator {
    if (!operatorStr) return FilterOperator.EQ;

    const allowedOperators = Object.values(FilterOperator);

    if (allowedOperators.includes(operatorStr as FilterOperator)) {
      return operatorStr as FilterOperator;
    }

    return FilterOperator.EQ;
  }

  private static parseValue(rawValue: any, operator: FilterOperator): any {
    if (typeof rawValue !== 'string') return rawValue;

    if ([FilterOperator.IN, FilterOperator.NOT_IN].includes(operator)) {
      return rawValue.split(',').map((item) => this.castValue(item, operator));
    }

    return this.castValue(rawValue, operator);
  }

  private static castValue(val: string, operator: FilterOperator): any {
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();

    if (lower === 'true') return true;
    if (lower === 'false') return false;

    // Parse string numbers as numbers for comparison filters or numeric IDs/fields
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const comparisonOperators = [
        FilterOperator.GT,
        FilterOperator.GTE,
        FilterOperator.LT,
        FilterOperator.LTE,
      ];
      if (comparisonOperators.includes(operator)) {
        const num = Number(trimmed);
        if (!isNaN(num)) return num;
      }
      return trimmed;
    }

    // Check for ISO Date format
    const dateValue = Date.parse(trimmed);
    if (!isNaN(dateValue) && (trimmed.includes('-') || trimmed.includes(':'))) {
      return new Date(trimmed);
    }

    return trimmed;
  }
}
