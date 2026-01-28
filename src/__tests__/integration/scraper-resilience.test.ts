import { MangaDexScraper, ScraperError, RateLimitError, CircuitBreakerOpenError, resetAllScraperBreakers } from '@/lib/scrapers/index'

// Mock fetch
global.fetch = jest.fn()

// PERFORMANCE: Mock setTimeout to speed up tests with retries
jest.useFakeTimers()
jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
  if (typeof cb === 'function') cb()
  return { unref: () => {} } as any
})

describe('Scraper Resilience Integration', () => {
  let scraper: MangaDexScraper

  beforeEach(() => {
    jest.clearAllMocks()
    resetAllScraperBreakers()
    scraper = new MangaDexScraper()
    // Reset internal state if possible, or just rely on fresh instance
  })

  it('should ignore 404 errors in circuit breaker', async () => {
    // Mock 404 response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    // Try multiple times - it should NOT open the circuit
    for (let i = 0; i < 10; i++) {
      await expect(scraper.scrapeSeries('test-id')).rejects.toThrow(ScraperError)
    }

    // If it didn't open, we should still be getting ScraperError (404) 
    // instead of CircuitBreakerOpenError
    await expect(scraper.scrapeSeries('test-id')).rejects.toThrow(ScraperError)
    await expect(scraper.scrapeSeries('test-id')).rejects.not.toThrow(CircuitBreakerOpenError)
  })

  it('should open circuit breaker after repeated 500 errors', async () => {
    const testUuid = '00000000-0000-0000-0000-000000000000'
    // Mock 500 response (retryable by default)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    try {
      for (let i = 0; i < 6; i++) {
        await scraper.scrapeSeries(testUuid).catch(() => {})
      }
    } catch (e) {
      // Ignore errors during setup
    }

    // Now it should be open
    await expect(scraper.scrapeSeries(testUuid)).rejects.toThrow(CircuitBreakerOpenError)
  })

  it('should NOT record failure for RateLimitError', async () => {
    const testUuid = '00000000-0000-0000-0000-000000000001'
    // Mock 429 response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Map([['Retry-After', '1']])
    })

    for (let i = 0; i < 10; i++) {
      await expect(scraper.scrapeSeries(testUuid)).rejects.toThrow()
    }

    // Should NOT be CircuitBreakerOpenError
    const finalResult = scraper.scrapeSeries(testUuid)
    await expect(finalResult).rejects.not.toThrow(CircuitBreakerOpenError)
  })
})
