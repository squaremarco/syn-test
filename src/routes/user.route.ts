import { Router } from 'express';

import { createUser, deleteUser, getAllUsers, getUser, updateUser } from '../controllers/user.controller';
import { createUserInputValidation, updateUserInputValidation } from '../models/user.model';
import { yupValidateMiddleware } from '../utils';

export const userRoute = () =>
  Router()
    .post('/users', yupValidateMiddleware(createUserInputValidation), createUser)
    .get('/users', getAllUsers)
    .get('/users/:id', getUser)
    .patch('/users/:id', yupValidateMiddleware(updateUserInputValidation), updateUser)
    .delete('/users/:id', deleteUser);
