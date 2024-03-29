import { Router } from 'express';

import { deleteUser, getAllUsers, getUser, signin, signup, updateUser } from '../controllers/user.controller';
import { yupValidateMiddleware } from '../middlewares';
import { signinInputValidation, signupInputValidation, updateUserInputValidation } from '../models/user.model';

export const userRoute = () =>
  Router()
    .post('/signup', yupValidateMiddleware(signupInputValidation), signup)
    .post('/signin', yupValidateMiddleware(signinInputValidation), signin)
    .get('/users', getAllUsers)
    .get('/users/:id', getUser)
    .patch('/users/:id', yupValidateMiddleware(updateUserInputValidation), updateUser)
    .delete('/users/:id', deleteUser);
