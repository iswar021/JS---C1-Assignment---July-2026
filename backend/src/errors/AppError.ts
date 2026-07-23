/**
 * Typed application errors. Each carries an HTTP status code and a stable,
 * machine-readable `code`. The centralized error handler converts these into the
 * consistent API error shape: { error: { code, message, details? } }.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 400 — request failed validation (schema or referential). */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

/** 404 — a referenced resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

/** 409 — a request conflicts with current state (e.g. invalid status transition). */
export class ConflictError extends AppError {
  constructor(message = 'Conflict', code = 'CONFLICT') {
    super(409, code, message);
  }
}
