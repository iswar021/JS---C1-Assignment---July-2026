/**
 * Test environment bootstrap. Sets NODE_ENV=test (silences the request logger)
 * and provides a placeholder DATABASE_URL so the PrismaClient can be constructed
 * when the app is imported. No real database connection is made: repositories are
 * mocked in the integration tests, so no query ever runs against this URL.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test_db?schema=public';
