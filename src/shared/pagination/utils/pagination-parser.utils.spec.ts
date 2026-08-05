import { PaginationParser } from './pagination-parser.utils';
import { FilterOperator, SortOrder } from '../domain/pagination.interfaces';

describe('PaginationParser', () => {
  it('should parse standard pagination query parameters with defaults', () => {
    const result = PaginationParser.parse({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.search).toBeUndefined();
    expect(result.sorts).toEqual([]);
    expect(result.filters).toEqual([]);
  });

  it('should handle custom page and limit parameters', () => {
    const result = PaginationParser.parse({ page: '3', limit: '25' });

    expect(result.page).toBe(3);
    expect(result.limit).toBe(25);
  });

  it('should restrict page to min 1 and limit to config maxLimit', () => {
    const result = PaginationParser.parse(
      { page: '-5', limit: '500' },
      { maxLimit: 50 },
    );

    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
  });

  it('should parse search terms correctly', () => {
    const result = PaginationParser.parse({ search: '  john doe  ' });

    expect(result.search).toBe('john doe');
  });

  it('should parse valid white-listed sort options', () => {
    const config = {
      sortableFields: ['created_at', 'name'],
    };

    const result = PaginationParser.parse(
      { sortBy: 'created_at', sortOrder: 'asc' },
      config,
    );

    expect(result.sorts).toEqual([
      { field: 'created_at', order: SortOrder.ASC },
    ]);
  });

  it('should ignore non-white-listed sort options and apply defaultSort', () => {
    const config = {
      sortableFields: ['name'],
      defaultSort: { field: 'created_at', order: SortOrder.DESC },
    };

    const result = PaginationParser.parse({ sortBy: 'created_at' }, config);

    expect(result.sorts).toEqual([
      { field: 'created_at', order: SortOrder.DESC },
    ]);
  });

  it('should parse simple equal filters if whitelisted', () => {
    const config = {
      filterableFields: ['status', 'role'],
    };

    const result = PaginationParser.parse(
      { status: 'active', role: 'admin', age: '25' },
      config,
    );

    expect(result.filters).toContainEqual({
      field: 'status',
      operator: FilterOperator.EQ,
      value: 'active',
    });
    expect(result.filters).toContainEqual({
      field: 'role',
      operator: FilterOperator.EQ,
      value: 'admin',
    });
    // 'age' is not filterable so it should be ignored
    expect(result.filters.find((f) => f.field === 'age')).toBeUndefined();
  });

  it('should parse bracketed operator syntax filters', () => {
    const config = {
      filterableFields: ['age', 'status', 'created_at'],
    };

    const result = PaginationParser.parse(
      {
        'age[gte]': '18',
        'age[lt]': '65',
        'status[neq]': 'inactive',
        'created_at[gte]': '2026-08-01',
      },
      config,
    );

    expect(result.filters).toContainEqual({
      field: 'age',
      operator: FilterOperator.GTE,
      value: 18,
    });
    expect(result.filters).toContainEqual({
      field: 'age',
      operator: FilterOperator.LT,
      value: 65,
    });
    expect(result.filters).toContainEqual({
      field: 'status',
      operator: FilterOperator.NEQ,
      value: 'inactive',
    });

    const createdAtFilter = result.filters.find(
      (f) => f.field === 'created_at',
    );
    expect(createdAtFilter).toBeDefined();
    expect(createdAtFilter?.operator).toBe(FilterOperator.GTE);
    expect(createdAtFilter?.value).toBeInstanceOf(Date);
  });

  it('should correctly cast boolean strings', () => {
    const config = {
      filterableFields: ['is_verified', 'is_active'],
    };

    const result = PaginationParser.parse(
      { is_verified: 'true', is_active: 'false' },
      config,
    );

    expect(result.filters).toContainEqual({
      field: 'is_verified',
      operator: FilterOperator.EQ,
      value: true,
    });
    expect(result.filters).toContainEqual({
      field: 'is_active',
      operator: FilterOperator.EQ,
      value: false,
    });
  });

  it('should correctly parse dynamic arrays for in/notIn operators', () => {
    const config = {
      filterableFields: ['role'],
    };

    const result = PaginationParser.parse(
      { 'role[in]': 'ADMIN, TEACHER, STUDENT' },
      config,
    );

    expect(result.filters).toEqual([
      {
        field: 'role',
        operator: FilterOperator.IN,
        value: ['ADMIN', 'TEACHER', 'STUDENT'],
      },
    ]);
  });
});
