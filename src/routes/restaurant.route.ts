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

export const restaurantRoute = () =>
  Router()
    .post('/restaurants', createRestaurant)
    .get('/restaurants', getAllRestaurants)
    .get('/restaurants/:id', getRestaurant)
    .patch('/restaurants/:id', updateRestaurant)
    .delete('/restaurants/:id', deleteRestaurant)
    .patch('/restaurants/like/:id', likeRestaurant)
    .patch('/restaurants/dislike/:id', dislikeRestaurant);
