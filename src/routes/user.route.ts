import { Router } from 'express';

import { createUser, deleteUser, getAllUsers, getUser, updateUser } from '../controllers/user.controller';

export const userRoute = () =>
  Router()
    .post('/users', createUser)
    .get('/users', getAllUsers)
    .get('/users/:id', getUser)
    .patch('/users/:id', updateUser)
    .delete('/users/:id', deleteUser);
