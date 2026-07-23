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

/**
 * Validates `req.query` against a zod schema. Because Express exposes `req.query`
 * as a read-only getter, the parsed (coerced, defaulted) value is stored on
 * `res.locals.query` for the controller to consume.
 */
export const validateQuery =
  (schema: AnyZodObject): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ValidationError('Validation failed', result.error.flatten().fieldErrors));
      return;
    }
    res.locals.query = result.data;
    next();
  };

/**
 * Validates `req.params` against a zod schema. The parsed value is stored on
 * `res.locals.params` for the controller to consume.
 */
export const validateParams =
  (schema: AnyZodObject): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(new ValidationError('Validation failed', result.error.flatten().fieldErrors));
      return;
    }
    res.locals.params = result.data;
    next();
  };
