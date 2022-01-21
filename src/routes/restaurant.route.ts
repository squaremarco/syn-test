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
import { createRestaurantInputValidation, updateRestaurantInputValidation } from '../models/restaurant.model';
import { yupValidateMiddleware } from '../utils';

export const restaurantRoute = () =>
  Router()
    .post('/restaurants', yupValidateMiddleware(createRestaurantInputValidation), createRestaurant)
    .get('/restaurants', getAllRestaurants)
    .get('/restaurants/:id', getRestaurant)
    .patch('/restaurants/:id', yupValidateMiddleware(updateRestaurantInputValidation), updateRestaurant)
    .delete('/restaurants/:id', deleteRestaurant)
    .patch('/restaurants/like/:id', likeRestaurant)
    .patch('/restaurants/dislike/:id', dislikeRestaurant);
