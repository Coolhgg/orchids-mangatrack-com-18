import '@testing-library/jest-dom'
import { config } from 'dotenv'

config()

type MockFn = jest.Mock

interface MockPrismaModel {
  findUnique: MockFn
  findFirst: MockFn
  findMany: MockFn
  create: MockFn
  createMany: MockFn
  update: MockFn
  updateMany: MockFn
  upsert: MockFn
  delete: MockFn
  deleteMany: MockFn
  count: MockFn
  aggregate: MockFn
  groupBy: MockFn
}

const createMockPrismaModel = (defaults: Partial<MockPrismaModel> = {}): MockPrismaModel => ({
  findUnique: jest.fn().mockResolvedValue(null),
  findFirst: jest.fn().mockResolvedValue(null),
  findMany: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockImplementation((args: { data?: Record<string, unknown> }) => Promise.resolve({ id: 'mock-id', ...args?.data })),
  createMany: jest.fn().mockResolvedValue({ count: 0 }),
  update: jest.fn().mockImplementation((args: { where?: { id?: string }; data?: Record<string, unknown> }) => Promise.resolve({ id: args?.where?.id, ...args?.data })),
  updateMany: jest.fn().mockResolvedValue({ count: 0 }),
  upsert: jest.fn().mockImplementation((args: { create?: Record<string, unknown> }) => Promise.resolve({ id: 'mock-id', ...args?.create })),
  delete: jest.fn().mockResolvedValue({}),
  deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  count: jest.fn().mockResolvedValue(0),
  aggregate: jest.fn().mockResolvedValue({}),
  groupBy: jest.fn().mockResolvedValue([]),
  ...defaults,
})

const SOFT_DELETE_MODELS = ['User', 'Series', 'Chapter', 'LibraryEntry']

const buildSoftDeleteSafeQuery = (baseQuery: string, tableName: string): string => {
  const isSoftDeleteModel = SOFT_DELETE_MODELS.some(
    model => tableName.toLowerCase().includes(model.toLowerCase())
  )
  
  if (!isSoftDeleteModel) {
    return baseQuery
  }
  
  const upperQuery = baseQuery.toUpperCase()
  const hasWhere = upperQuery.includes('WHERE')
  const hasDeletedAtFilter = baseQuery.toLowerCase().includes('deleted_at')
  
  if (hasDeletedAtFilter) {
    return baseQuery
  }
  
  if (hasWhere) {
    const whereIndex = upperQuery.indexOf('WHERE')
    const afterWhere = whereIndex + 6
    return `${baseQuery.slice(0, afterWhere)} ${tableName}.deleted_at IS NULL AND ${baseQuery.slice(afterWhere)}`
  } else {
    const orderByIndex = upperQuery.indexOf('ORDER BY')
    const limitIndex = upperQuery.indexOf('LIMIT')
    const groupByIndex = upperQuery.indexOf('GROUP BY')
    
    const insertPoint = Math.min(
      orderByIndex > -1 ? orderByIndex : baseQuery.length,
      limitIndex > -1 ? limitIndex : baseQuery.length,
      groupByIndex > -1 ? groupByIndex : baseQuery.length
    )
    
    return `${baseQuery.slice(0, insertPoint)} WHERE ${tableName}.deleted_at IS NULL ${baseQuery.slice(insertPoint)}`
  }
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn((fn: unknown) => {
      if (typeof fn === 'function') {
        return fn({
          workerFailure: createMockPrismaModel(),
          auditLog: createMockPrismaModel(),
          series: createMockPrismaModel(),
          user: createMockPrismaModel(),
          chapter: createMockPrismaModel(),
          chapterSource: createMockPrismaModel(),
          seriesSource: createMockPrismaModel(),
          legacyChapter: createMockPrismaModel(),
          feedEntry: createMockPrismaModel(),
          libraryEntry: createMockPrismaModel(),
          notification: createMockPrismaModel(),
          queryStats: createMockPrismaModel(),
          userChapterReadV2: createMockPrismaModel(),
          $executeRaw: jest.fn(),
        })
      }
      return Promise.all(fn as Promise<unknown>[])
    }),
    workerFailure: createMockPrismaModel(),
    auditLog: createMockPrismaModel(),
    series: createMockPrismaModel(),
    user: createMockPrismaModel(),
    chapter: createMockPrismaModel(),
    chapterSource: createMockPrismaModel(),
    seriesSource: createMockPrismaModel(),
    legacyChapter: createMockPrismaModel(),
    feedEntry: createMockPrismaModel(),
    libraryEntry: createMockPrismaModel(),
    notification: createMockPrismaModel(),
    queryStats: createMockPrismaModel(),
    userChapterReadV2: createMockPrismaModel(),
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  },
  isTransientError: jest.fn().mockReturnValue(false),
  buildSoftDeleteSafeQuery,
}))

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
} else if (process.env.NODE_ENV === 'test') {
  process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock'
}
if (process.env.TEST_DIRECT_URL) {
  process.env.DIRECT_URL = process.env.TEST_DIRECT_URL
}
if (process.env.TEST_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.TEST_SUPABASE_URL
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.TEST_SUPABASE_URL
}
if (process.env.TEST_SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY
}
if (process.env.TEST_SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY
}

global.fetch = jest.fn()
global.Request = jest.fn() as unknown as typeof Request
global.Response = jest.fn() as unknown as typeof Response

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '',
}))
