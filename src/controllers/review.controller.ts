import { Request, Response } from 'express';
import { any, isNil } from 'ramda';

import { Restaurant } from '../models/restaurant.model';
import { CreateReviewInputValidation, Review, UpdateReviewInputValidation } from '../models/review.model';
import { User } from '../models/user.model';
import { setRestaurantAverageScoreAndPrice } from '../utils';

export const createReview = async (req: Request<any, any, CreateReviewInputValidation['body']>, res: Response) => {
  const { user: userInput, restaurant: restaurantInput, content, score, price } = req.body;

  const user = await User.findById(userInput);
  const restaurant = await Restaurant.findById(restaurantInput);

  if (any(isNil, [restaurant, user])) {
    return res
      .status(404)
      .send({ message: `User with id "${userInput}" or Restaurant with id "${restaurantInput}" not found.` });
  }

  const review = await Review.findOne({ user: userInput, restaurant: restaurantInput });

  if (!isNil(review)) {
    return res.status(422).send({ message: `Can't review a restaurant more than once. Update your review instead.` });
  }

  const data = await Review.create({ content, score, price, user: userInput, restaurant: restaurantInput });

  await User.findByIdAndUpdate(userInput, { $push: { reviews: data.id } });
  await Restaurant.findByIdAndUpdate(restaurantInput, { $push: { reviews: data.id } });

  await setRestaurantAverageScoreAndPrice(restaurantInput);

  return res.send({ data });
};

export const getAllReviews = async (_: Request, res: Response) => {
  const data = await Review.find().sort('-updatedAt').populate(['user', 'restaurant']).exec();

  return res.send({ data });
};

export const getReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await Review.findById(id).populate(['user', 'restaurant']);

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
  const { content, score, price } = req.body;

  const review = await Review.findById(id);

  if (isNil(review)) {
    return res.status(404).send({ message: `Review with id "${id}" not found.` });
  }

  await Review.findByIdAndUpdate(id, { content, score, price: price ?? review.price });
  await setRestaurantAverageScoreAndPrice(review.restaurant);

  const data = await Review.findById(id);

  return res.send({ data });
};

export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (isNil(review)) {
    return res.status(404).send({ message: `Review with id "${id}" not found.` });
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
