import { RequestHandler } from 'express';
import * as userService from './user.service';

/** GET /api/users — list seeded users. */
export const listUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};
