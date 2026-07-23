import { Router } from 'express';
import * as userController from './user.controller';

export const userRouter = Router();

// List seeded users
userRouter.get('/', userController.listUsers);
