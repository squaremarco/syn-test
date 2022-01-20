import { Router } from 'express';

import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  pinReview,
  unpinReview,
  updateReview
} from '../controllers/review.controller';

export const reviewRoute = () =>
  Router()
    .post('/reviews', createReview)
    .get('/reviews', getAllReviews)
    .get('/reviews/:id', getReview)
    .patch('/reviews/:id', updateReview)
    .delete('/reviews/:id', deleteReview)
    .patch('/reviews/pin/:id', pinReview)
    .patch('/reviews/unpin', unpinReview);
