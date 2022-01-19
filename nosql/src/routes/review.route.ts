import { Router } from 'express';

import { createReview, deleteReview, getAllReviews, getReview, updateReview } from '../controllers/review.controller';

export const reviewRoute = () => {
  const router = Router();

  router.post('/reviews', createReview);

  router.get('/reviews', getAllReviews);

  router.get('/reviews/:id', getReview);

  router.patch('/reviews/:id', updateReview);

  router.delete('/reviews/:id', deleteReview);

  return router;
};
