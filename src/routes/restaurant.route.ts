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

export const restaurantRoute = () => {
  const router = Router();

  router.post('/restaurants', createRestaurant);

  router.get('/restaurants', getAllRestaurants);

  router.get('/restaurants/:id', getRestaurant);

  router.patch('/restaurants/:id', updateRestaurant);

  router.delete('/restaurants/:id', deleteRestaurant);

  router.patch('/restaurants/like/:id', likeRestaurant);

  router.patch('/restaurants/dislike/:id', dislikeRestaurant);

  return router;
};
