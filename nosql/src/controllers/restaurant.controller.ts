import { Request, Response } from 'express';

import { Restaurant, RestaurantInput } from '../models/restaurant.model';
import { Review } from '../models/review.model';
import { User } from '../models/user.model';

export const createRestaurant = async (req: Request, res: Response) => {
  const { name, paymentTypes, pictures, tags } = req.body;

  if (!name || !paymentTypes || !tags) {
    return res.status(422).json({ message: 'The fields name, paymentTypes and tags are required' });
  }

  const data = await Restaurant.create<RestaurantInput>({ name, paymentTypes, pictures, tags });

  return res.status(201).json({ data });
};

export const getAllRestaurants = async (_: Request, res: Response) => {
  const data = await Restaurant.find().sort('-updatedAt').exec();

  return res.status(200).json({ data });
};

export const getRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await Restaurant.findById(id);

  if (!data) {
    return res.status(404).json({ message: `Place with id "${id}" not found.` });
  }

  return res.status(200).json({ data });
};

export const updateRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, paymentTypes, pictures, tags } = req.body;

  const restaurant = await Restaurant.findById(id);

  if (!restaurant) {
    return res.status(404).json({ message: `Restaurant with id "${id}" not found.` });
  }

  if (!name || !paymentTypes || !tags) {
    return res.status(422).json({ message: 'The fields name, paymentTypes and tags are required' });
  }

  await Restaurant.findByIdAndUpdate(id, { name, paymentTypes, pictures: pictures ?? restaurant.pictures, tags });

  const data = await Restaurant.findById(id);

  return res.status(200).json({ data });
};

export const deleteRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findById(id);

  if (!restaurant) {
    return res.status(404).json({ message: `Place with id "${id}" not found.` });
  }

  await Restaurant.findByIdAndDelete(id);

  const reviewsByRestaurant = (await Review.find({ restaurantId: id })).map(r => r.id as string);

  await Review.deleteMany({ id: { $in: reviewsByRestaurant } });
  await User.updateMany({ reviews: { $in: reviewsByRestaurant } }, { $pullAll: { reviews: reviewsByRestaurant } });
  await User.updateMany({ likes: id }, { $pull: { likes: id } });

  return res.status(200).json({ message: 'Restaurant deleted successfully.' });
};

export const likeRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  const restaurant = await Restaurant.findById(id);
  const user = await User.findById(userId);

  if (!restaurant || !user) {
    return res.status(404).json({ message: `Restaurant with id "${id}" or User with id "${userId}" not found.` });
  }

  const userAlreadyLikes = await User.findOne({ _id: userId, likes: { $in: id } });

  if (userAlreadyLikes) {
    return res.status(422).json({ message: `User with id "${userId}" already likes Restaurant with id "${id}".` });
  }

  await User.findByIdAndUpdate(userId, { $push: { likes: id } });

  return res.status(200).json({ message: 'Restaurant liked successfully.' });
};

export const dislikeRestaurant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  const restaurant = await Restaurant.findById(id);
  const user = await User.findById(userId);

  if (!restaurant || !user) {
    return res.status(404).json({ message: `Restaurant with id "${id}" or User with id "${userId}" not found.` });
  }

  const userDoesntLike = await User.findOne({ id: userId, likes: { $in: id } });

  if (!userDoesntLike) {
    return res.status(422).json({ message: `User with id "${userId}" doesn't like Restaurant with id "${id}".` });
  }

  await User.findByIdAndUpdate(userId, { $pull: { likes: id } });

  return res.status(200).json({ message: 'Restaurant disliked successfully.' });
};
