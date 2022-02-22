import { Router } from 'express';

import {
  createRestaurant,
  deleteRestaurant,
  dislikeRestaurant,
  getAllRestaurants,
  getRestaurant,
  likeRestaurant,
  updateRestaurant
} from '../controllers/restaurant.controller';
import { rolesMiddleware, yupValidateMiddleware } from '../middlewares';
import { createRestaurantInputValidation, updateRestaurantInputValidation } from '../models/restaurant.model';

export const restaurantRoute = () =>
  Router()
    .post(
      '/restaurants',
      [rolesMiddleware('admin'), yupValidateMiddleware(createRestaurantInputValidation)],
      createRestaurant
    )
    .get('/restaurants', getAllRestaurants)
    .get('/restaurants/:id', getRestaurant)
    .patch(
      '/restaurants/:id',
      [rolesMiddleware('admin'), yupValidateMiddleware(updateRestaurantInputValidation)],
      updateRestaurant
    )
    .delete('/restaurants/:id', rolesMiddleware('admin'), deleteRestaurant)
    .patch('/restaurants/like/:id', likeRestaurant)
    .patch('/restaurants/dislike/:id', dislikeRestaurant);
