import { RequestHandler } from 'express';
import { AnyZodObject } from 'zod';
import { ValidationError } from '../errors/AppError';

/**
 * Validates and normalizes `req.body` against a zod schema.
 * On failure, forwards a ValidationError (400) with field-level details.
 * On success, replaces req.body with the parsed (typed, trimmed) value.
 */
export const validateBody =
  (schema: AnyZodObject): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError('Validation failed', result.error.flatten().fieldErrors));
      return;
    }
    req.body = result.data;
    next();
  };
