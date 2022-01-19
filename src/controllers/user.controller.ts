import { Request, Response } from 'express';

import { Restaurant } from '../models/restaurant.model';
import { Review } from '../models/review.model';
import { User, UserInput } from '../models/user.model';
import { calculateScoreAndPrice } from '../utils';

export const createUser = async (req: Request, res: Response) => {
  const { email, firstName, lastName, password } = req.body;

  if (!email || !firstName || !lastName || !password) {
    return res.status(422).json({ message: 'The fields firstName, lastName, email and password are required' });
  }

  const data = await User.create<UserInput>({
    firstName,
    lastName,
    email,
    password // Yes, I do save the password as plain text for simplicity
  });

  return res.status(201).json({ data });
};

export const getAllUsers = async (_: Request, res: Response) => {
  const data = await User.find().sort('-updatedAt').exec();

  return res.status(200).json({ data });
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await User.findById(id);

  if (!data) {
    return res.status(404).json({ message: `User with id "${id}" not found.` });
  }

  return res.status(200).json({ data });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: `User with id "${id}" not found.` });
  }

  if (!firstName || !lastName) {
    return res.status(422).json({ message: 'The fields firstName and lastName are required' });
  }

  await User.findByIdAndUpdate(id, { firstName, lastName });

  const data = await User.findById(id);

  return res.status(200).json({ data });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  await User.findByIdAndDelete(id);

  const reviewsByUser = (await Review.find({ userId: id })).map(r => r.id as string);
  const restaurantByReviews = (await Restaurant.find({ reviews: { $in: reviewsByUser } })).map(r => r.id as string);

  await Review.deleteMany({ userId: id });
  await Restaurant.updateMany({ reviews: { $in: reviewsByUser } }, { $pullAll: { reviews: reviewsByUser } });
  await Promise.all(restaurantByReviews.map(calculateScoreAndPrice));

  return res.status(200).json({ message: 'User deleted successfully.' });
};
