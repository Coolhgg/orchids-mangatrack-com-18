import { isTransientError } from '@/lib/prisma'

describe('prisma utilities', () => {
  describe('isTransientError', () => {
    it('should return false for null/undefined', () => {
      expect(isTransientError(null)).toBe(false)
      expect(isTransientError(undefined)).toBe(false)
    })

    it('should detect connection refused errors', () => {
      const error = new Error('Connection refused')
      expect(isTransientError(error)).toBe(true)
    })

    it('should detect connection reset errors', () => {
      const error = new Error('ECONNRESET: connection reset by peer')
      expect(isTransientError(error)).toBe(true)
    })

    it('should detect timeout errors', () => {
      const error = new Error('ETIMEDOUT: Connection timed out')
      expect(isTransientError(error)).toBe(true)
    })

    it('should detect pool timeout errors', () => {
      const error = new Error('pool_timeout: Timed out waiting for connection')
      expect(isTransientError(error)).toBe(true)
    })

    it('should detect circuit breaker errors', () => {
      const error = new Error('Circuit breaker triggered')
      expect(isTransientError(error)).toBe(true)
    })

    it('should detect database unreachable errors', () => {
      const error = new Error("Can't reach database server")
      expect(isTransientError(error)).toBe(true)
    })

    it('should detect too many connections errors', () => {
      const error = new Error('too many connections for role')
      expect(isTransientError(error)).toBe(true)
    })

    it('should detect SSL connection errors', () => {
      const error = new Error('SSL connection has been closed unexpectedly')
      expect(isTransientError(error)).toBe(true)
    })

    it('should detect transient Prisma error codes', () => {
      const p1001 = { message: 'Some error', code: 'P1001' }
      const p1002 = { message: 'Some error', code: 'P1002' }
      const p2024 = { message: 'Some error', code: 'P2024' }
      
      expect(isTransientError(p1001)).toBe(true)
      expect(isTransientError(p1002)).toBe(true)
      expect(isTransientError(p2024)).toBe(true)
    })

    it('should detect PostgreSQL transient codes', () => {
      const deadlock = { message: 'Deadlock detected', code: '40001' }
      const serializationFailure = { message: 'Serialization failure', code: '40P01' }
      
      expect(isTransientError(deadlock)).toBe(true)
      expect(isTransientError(serializationFailure)).toBe(true)
    })

    it('should detect PrismaClientInitializationError', () => {
      const error = { name: 'PrismaClientInitializationError', message: 'Failed to initialize' }
      expect(isTransientError(error)).toBe(true)
    })

    it('should NOT treat authentication errors as transient', () => {
      const authError = new Error('password authentication failed for user')
      expect(isTransientError(authError)).toBe(false)
    })

    it('should NOT treat access denied errors as transient', () => {
      const error = new Error('access denied for user')
      expect(isTransientError(error)).toBe(false)
    })

    it('should NOT treat permission denied errors as transient', () => {
      const error = new Error('permission denied for table users')
      expect(isTransientError(error)).toBe(false)
    })

    it('should NOT treat invalid credentials errors as transient', () => {
      const error = new Error('invalid credentials provided')
      expect(isTransientError(error)).toBe(false)
    })

    it('should NOT treat non-transient Prisma codes as transient', () => {
      const p1000 = { message: 'Auth error', code: 'P1000' }
      const p1003 = { message: 'DB not found', code: 'P1003' }
      
      expect(isTransientError(p1000)).toBe(false)
      expect(isTransientError(p1003)).toBe(false)
    })

    it('should NOT treat generic errors as transient', () => {
      const error = new Error('Some random error')
      expect(isTransientError(error)).toBe(false)
    })

    it('should NOT treat validation errors as transient', () => {
      const error = new Error('Invalid data provided')
      expect(isTransientError(error)).toBe(false)
    })

    it('should handle errors with constructor.name', () => {
      class PrismaClientKnownRequestError extends Error {
        code = 'P2024'
      }
      const error = new PrismaClientKnownRequestError('Connection error')
      expect(isTransientError(error)).toBe(true)
    })

    it('should handle errors without message', () => {
      const error = { code: 'P1001' }
      expect(isTransientError(error)).toBe(true)
    })

    it('should handle string errors', () => {
      expect(isTransientError('Connection refused')).toBe(false)
    })
  })
})
