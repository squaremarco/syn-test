import { Request, Response } from 'express';
import { any, isNil, map, pick } from 'ramda';

import {
  CreateRestaurantInputValidation,
  Restaurant,
  UpdateRestaurantInputValidation
} from '../models/restaurant.model';
import { Review } from '../models/review.model';
import { User } from '../models/user.model';

export const createRestaurant = async (
  req: Request<any, any, CreateRestaurantInputValidation['body']>,
  res: Response
) => {
  const { name, paymentTypes, pictures, menuGroups, tags } = req.body;

  const data = await Restaurant.create({ name, paymentTypes, pictures, menuGroups, tags });

  return res.send({ data });
};

export const getAllRestaurants = async (_: Request, res: Response) => {
  const data = await Restaurant.find()
    .populate({ path: 'pinnedReview', populate: { path: 'user' } })
    .populate({ path: 'reviews', populate: { path: 'user' } })
    .sort('-updatedAt');

  return res.send({ data });
};

export const getRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await Restaurant.findById(id)
    .populate({ path: 'pinnedReview', populate: { path: 'user' } })
    .populate({ path: 'reviews', populate: { path: 'user' } });

  if (isNil(data)) {
    return res.status(404).send({ message: `Place with id "${id}" not found.` });
  }

  return res.send({ data });
};

export const updateRestaurant = async (
  req: Request<{ id: string }, any, UpdateRestaurantInputValidation['body']>,
  res: Response
) => {
  const { id } = req.params;
  const { name, paymentTypes, menuGroups, pinnedReview, pictures, tags } = req.body;

  const restaurant = await Restaurant.findById(id);

  if (isNil(restaurant)) {
    return res.status(404).send({ message: `Restaurant with id "${id}" not found.` });
  }

  await Restaurant.findByIdAndUpdate(id, {
    name: name ?? restaurant.name,
    paymentTypes: paymentTypes ?? restaurant.paymentTypes,
    pinnedReview: pinnedReview ?? restaurant.pinnedReview,
    menuGroups: menuGroups ?? restaurant.menuGroups,
    pictures: pictures ?? restaurant.pictures,
    tags: tags ?? restaurant.tags
  });

  const data = await Restaurant.findById(id);

  return res.send({ data });
};

export const deleteRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findById(id);

  if (isNil(restaurant)) {
    return res.status(404).send({ message: `Place with id "${id}" not found.` });
  }

  await Restaurant.findByIdAndDelete(id);

  const reviewsByRestaurant = map(pick(['id']), await Review.find({ restaurant: id }));

  await Review.deleteMany({ id: { $in: reviewsByRestaurant } });
  await User.updateMany({ reviews: { $in: reviewsByRestaurant } }, { $pullAll: { reviews: reviewsByRestaurant } });
  await User.updateMany({ likes: id }, { $pull: { likes: id } });

  return res.send({ message: 'Restaurant deleted successfully.' });
};

export const likeRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.scopedInfo!;

  const restaurant = await Restaurant.findById(id);
  const user = await User.findById(userId);

  if (any(isNil, [restaurant, user])) {
    return res.status(404).send({ message: `Restaurant with id "${id}" or User with id "${userId}" not found.` });
  }

  const userAlreadyLikes = await User.findOne({ _id: userId, likes: { $in: id } });

  if (!isNil(userAlreadyLikes)) {
    return res.status(422).send({ message: `User with id "${userId}" already likes Restaurant with id "${id}".` });
  }

  await User.findByIdAndUpdate(userId, { $push: { likes: id } });

  return res.send({ message: 'Restaurant liked successfully.' });
};

export const dislikeRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.scopedInfo!;

  const restaurant = await Restaurant.findById(id);
  const user = await User.findById(userId);

  if (any(isNil, [restaurant, user])) {
    return res.status(404).send({ message: `Restaurant with id "${id}" or User with id "${userId}" not found.` });
  }

  const userDoesntLike = await User.findOne({ id: userId, likes: { $in: id } });

  if (isNil(userDoesntLike)) {
    return res.status(422).send({ message: `User with id "${userId}" doesn't like Restaurant with id "${id}".` });
  }

  await User.findByIdAndUpdate(userId, { $pull: { likes: id } });

  return res.send({ message: 'Restaurant disliked successfully.' });
};
