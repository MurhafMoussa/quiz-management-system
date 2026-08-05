import { PrismaPaginationAdapter } from './prisma-pagination.adapter';
import {
  PaginationParams,
  FilterOperator,
  SortOrder,
} from '../domain/pagination.interfaces';

describe('PrismaPaginationAdapter', () => {
  describe('buildQuery', () => {
    it('should generate basic skip and take parameters', () => {
      const params: PaginationParams = {
        page: 2,
        limit: 15,
        filters: [],
        sorts: [],
      };

      const result = PrismaPaginationAdapter.buildQuery(params);

      expect(result.skip).toBe(15);
      expect(result.take).toBe(15);
      expect(result.where).toEqual({});
      expect(result.orderBy).toBeUndefined();
    });

    it('should map filter rules to Prisma queries', () => {
      const params: PaginationParams = {
        page: 1,
        limit: 10,
        filters: [
          {
            field: 'status',
            operator: FilterOperator.EQ,
            value: 'active',
          },
          {
            field: 'role',
            operator: FilterOperator.IN,
            value: ['ADMIN', 'TEACHER'],
          },
          { field: 'age', operator: FilterOperator.GTE, value: 21 },
        ],
        sorts: [],
      };

      const result = PrismaPaginationAdapter.buildQuery(params);

      expect(result.where).toEqual({
        AND: [
          { status: 'active' },
          { role: { in: ['ADMIN', 'TEACHER'] } },
          { age: { gte: 21 } },
        ],
      });
    });

    it('should handle nested relation filters and nested sorting', () => {
      const params: PaginationParams = {
        page: 1,
        limit: 10,
        filters: [
          {
            field: 'studentProfile.major',
            operator: FilterOperator.EQ,
            value: 'CS',
          },
        ],
        sorts: [
          { field: 'studentProfile.student_id_code', order: SortOrder.ASC },
        ],
      };

      const result = PrismaPaginationAdapter.buildQuery(params);

      expect(result.where).toEqual({
        AND: [{ studentProfile: { major: 'CS' } }],
      });
      expect(result.orderBy).toEqual([
        { studentProfile: { student_id_code: 'asc' } },
      ]);
    });

    it('should generate search clauses with case insensitivity mode', () => {
      const params: PaginationParams = {
        page: 1,
        limit: 10,
        search: 'john',
        filters: [],
        sorts: [],
      };

      const config = {
        searchableFields: ['first_name', 'last_name', 'studentProfile.major'],
      };

      const result = PrismaPaginationAdapter.buildQuery(params, config);

      expect(result.where).toEqual({
        AND: [
          {
            OR: [
              { first_name: { contains: 'john', mode: 'insensitive' } },
              { last_name: { contains: 'john', mode: 'insensitive' } },
              {
                studentProfile: {
                  major: { contains: 'john', mode: 'insensitive' },
                },
              },
            ],
          },
        ],
      });
    });

    it('should parse sort order fields correctly', () => {
      const params: PaginationParams = {
        page: 1,
        limit: 10,
        filters: [],
        sorts: [
          { field: 'created_at', order: SortOrder.DESC },
          { field: 'name', order: SortOrder.ASC },
        ],
      };

      const result = PrismaPaginationAdapter.buildQuery(params);

      expect(result.orderBy).toEqual([{ created_at: 'desc' }, { name: 'asc' }]);
    });
  });

  describe('toResult', () => {
    it('should map items and pagination data to result format', () => {
      const params: PaginationParams = {
        page: 2,
        limit: 5,
        filters: [],
        sorts: [],
      };

      const result = PrismaPaginationAdapter.toResult(
        ['item1', 'item2'],
        12,
        params,
      );

      expect(result.items).toEqual(['item1', 'item2']);
      expect(result.meta).toEqual({
        total: 12,
        page: 2,
        limit: 5,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });
  });

  describe('paginate', () => {
    it('should call findMany and count concurrently on prisma model delegate', async () => {
      const mockItems = [{ id: 1, name: 'Item 1' }];
      const mockCount = 100;

      const mockModelDelegate = {
        findMany: jest.fn().mockResolvedValue(mockItems),
        count: jest.fn().mockResolvedValue(mockCount),
      };

      const params: PaginationParams = {
        page: 1,
        limit: 10,
        filters: [],
        sorts: [],
      };

      const result = await PrismaPaginationAdapter.paginate(
        mockModelDelegate,
        params,
        {
          include: { profile: true },
        },
      );

      expect(mockModelDelegate.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: undefined,
        include: { profile: true },
      });
      expect(mockModelDelegate.count).toHaveBeenCalledWith({
        where: {},
      });

      expect(result.items).toEqual(mockItems);
      expect(result.meta.total).toBe(100);
      expect(result.meta.totalPages).toBe(10);
    });
  });
});
