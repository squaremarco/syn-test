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
import { yupValidateMiddleware } from '../middlewares';
import { createReviewInputValidation, updateReviewInputValidation } from '../models/review.model';

export const reviewRoute = () =>
  Router()
    .post('/reviews', yupValidateMiddleware(createReviewInputValidation), createReview)
    .get('/reviews', getAllReviews)
    .get('/reviews/:id', getReview)
    .patch('/reviews/:id', yupValidateMiddleware(updateReviewInputValidation), updateReview)
    .delete('/reviews/:id', deleteReview)
    .patch('/reviews/pin/:id', pinReview)
    .patch('/reviews/unpin', unpinReview);
