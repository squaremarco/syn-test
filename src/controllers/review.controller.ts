import { Request, Response } from 'express';

import { Restaurant } from '../models/restaurant.model';
import { Review, ReviewInput } from '../models/review.model';
import { User } from '../models/user.model';
import { calculateScoreAndPrice } from '../utils';

export const createReview = async (req: Request, res: Response) => {
  const { userId, restaurantId, content, score, price } = req.body;

  if (!userId || !restaurantId || !content || !score) {
    return res.status(422).send({ message: 'The fields userId, restaurantId, content and score are required' });
  }

  const user = await User.findById(userId);
  const restaurant = await Restaurant.findById(restaurantId);

  if (!user || !restaurant) {
    return res
      .status(404)
      .send({ message: `User with id "${userId}" or Restaurant with id "${restaurantId}" not found.` });
  }

  const review = await Review.findOne({ userId, restaurantId });

  if (review) {
    return res.status(422).send({ message: `Can't review a restaurant more than once. Update your review instead.` });
  }

  const data = await Review.create<ReviewInput>({ content, score, price, userId, restaurantId });

  await User.findByIdAndUpdate(userId, { $push: { reviews: data.id } });
  await Restaurant.findByIdAndUpdate(restaurantId, { $push: { reviews: data.id } });

  await calculateScoreAndPrice(restaurantId);

  return res.send({ data });
};

export const getAllReviews = async (_: Request, res: Response) => {
  const data = await Review.find().sort('-updatedAt').exec();

  return res.send({ data });
};

export const getReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await Review.findById(id);

  if (!data) {
    return res.status(404).send({ message: `Review with id "${id}" not found.` });
  }

  return res.send({ data });
};

export const updateReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, score, price } = req.body;

  const review = await Review.findById(id);

  if (!review) {
    return res.status(404).send({ message: `Review with id "${id}" not found.` });
  }

  if (!content || !score) {
    return res.status(422).send({ message: 'The fields content and score are required' });
  }

  await Review.findByIdAndUpdate(id, { content, score, price: price ?? review.price });
  await calculateScoreAndPrice(review.restaurantId);

  const data = await Review.findById(id);

  return res.send({ data });
};

export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    return res.status(404).send({ message: `Review with id "${id}" not found.` });
  }

  await Review.findByIdAndDelete(id);
  await User.findByIdAndUpdate(review.userId, { $pull: { reviews: id } });
  await Restaurant.findByIdAndUpdate(review.restaurantId, { $pull: { reviews: id } });
  await calculateScoreAndPrice(review.restaurantId);

  return res.send({ message: 'Review deleted successfully.' });
};

export const pinReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { restaurantId } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  const review = await Review.findById(id);

  if (!restaurant || !review) {
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

  if (!restaurant) {
    return res.status(404).send({ message: `Restaurant with id "${restaurantId}" not found.` });
  }

  await Restaurant.findByIdAndUpdate(restaurantId, { pinnedReview: null });

  return res.send({ message: 'Review unpinned successfully.' });
};
