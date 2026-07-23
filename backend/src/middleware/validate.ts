import { RequestHandler } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { ValidationError } from '../errors/AppError';

/**
 * Normalizes a ZodError into a details object. Field-level errors are keyed by
 * field name; object-level errors (e.g. "at least one field required",
 * unrecognized keys) are collected under `_errors`.
 */
function formatZodError(error: ZodError): Record<string, unknown> {
  const { fieldErrors, formErrors } = error.flatten();
  return {
    ...fieldErrors,
    ...(formErrors.length ? { _errors: formErrors } : {}),
  };
}

/** Validates and normalizes `req.body` against a zod schema. */
export const validateBody =
  (schema: ZodTypeAny): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError('Validation failed', formatZodError(result.error)));
      return;
    }
    req.body = result.data;
    next();
  };

/**
 * Validates `req.query`. Because Express exposes `req.query` as a read-only getter,
 * the parsed (coerced, defaulted) value is stored on `res.locals.query`.
 */
export const validateQuery =
  (schema: ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ValidationError('Validation failed', formatZodError(result.error)));
      return;
    }
    res.locals.query = result.data;
    next();
  };

/** Validates `req.params`; the parsed value is stored on `res.locals.params`. */
export const validateParams =
  (schema: ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(new ValidationError('Validation failed', formatZodError(result.error)));
      return;
    }
    res.locals.params = result.data;
    next();
  };
