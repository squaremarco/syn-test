import { Request, Response } from 'express';
import { any, isNil } from 'ramda';

import { Restaurant } from '../models/restaurant.model';
import { CreateReviewInputValidation, Review, UpdateReviewInputValidation } from '../models/review.model';
import { User } from '../models/user.model';
import { setRestaurantAverageScoreAndPrice } from '../utils';

export const createReview = async (req: Request<any, any, CreateReviewInputValidation['body']>, res: Response) => {
  const { id: userId } = req.scopedInfo!;
  const { restaurant: restaurantId, content, score, price } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);

  if (isNil(restaurant)) {
    return res.status(404).send({ message: `Restaurant with id "${restaurantId}" not found.` });
  }

  const review = await Review.findOne({ user: userId, restaurant: restaurantId });

  if (!isNil(review)) {
    return res.status(422).send({ message: `Can't review a restaurant more than once. Update your review instead.` });
  }

  const data = await Review.create({ content, score, price, user: userId, restaurant: restaurantId });

  await User.findByIdAndUpdate(userId, { $push: { reviews: data.id } });
  await Restaurant.findByIdAndUpdate(restaurantId, { $push: { reviews: data.id } });

  await setRestaurantAverageScoreAndPrice(restaurantId);

  return res.send({ data });
};

export const getAllReviews = async (_: Request, res: Response) => {
  const data = await Review.find()
    .sort('-updatedAt')
    .populate({ path: 'user', select: '-password' })
    .populate('restaurant')
    .exec();

  return res.send({ data });
};

export const getReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await Review.findById(id).populate({ path: 'user', select: '-password' }).populate('restaurant');

  if (isNil(data)) {
    return res.status(404).send({ message: `Review with id "${id}" not found.` });
  }

  return res.send({ data });
};

export const updateReview = async (
  req: Request<{ id: string }, any, UpdateReviewInputValidation['body']>,
  res: Response
) => {
  const { id } = req.params;
  const { id: userId } = req.scopedInfo!;
  const { content, score, price } = req.body;

  const review = await Review.findById(id);

  if (isNil(review)) {
    return res.status(404).send({ message: `Review with id "${id}" not found.` });
  }

  if (!review.user.equals(userId)) {
    return res.status(422).send({ message: `Can't update review that you don't own.` });
  }

  await Review.findByIdAndUpdate(id, {
    content: content ?? review.content,
    score: score ?? review.score,
    price: price ?? review.price
  });
  await setRestaurantAverageScoreAndPrice(review.restaurant);

  const data = await Review.findById(id);

  return res.send({ data });
};

export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.scopedInfo!;

  const review = await Review.findById(id);

  if (isNil(review)) {
    return res.status(404).send({ message: `Review with id "${id}" not found.` });
  }

  if (!review.user.equals(userId)) {
    return res.status(422).send({ message: `Can't delete a review that you don't own.` });
  }

  await Review.findByIdAndDelete(id);
  await User.findByIdAndUpdate(review.user, { $pull: { reviews: id } });
  await Restaurant.findByIdAndUpdate(review.restaurant, { $pull: { reviews: id } });
  await setRestaurantAverageScoreAndPrice(review.restaurant);

  return res.send({ message: 'Review deleted successfully.' });
};

export const pinReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { restaurantId } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  const review = await Review.findById(id);

  if (any(isNil, [restaurant, review])) {
    return res
      .status(404)
      .send({ message: `Restaurant with id "${restaurantId}" or Review with id "${id}" not found.` });
  }

  await Restaurant.findByIdAndUpdate(restaurantId, { pinnedReview: id });

  return res.send({ message: 'Review pinned successfully.' });
};

export const unpinReview = async (req: Request, res: Response) => {
  const { restaurantId } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);

  if (isNil(restaurant)) {
    return res.status(404).send({ message: `Restaurant with id "${restaurantId}" not found.` });
  }

  await Restaurant.findByIdAndUpdate(restaurantId, { pinnedReview: null });

  return res.send({ message: 'Review unpinned successfully.' });
};
