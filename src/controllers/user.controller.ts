import { Request, Response } from 'express';

import { Restaurant } from '../models/restaurant.model';
import { Review } from '../models/review.model';
import { CreateUserInputValidation, UpdateUserInputValidation, User } from '../models/user.model';
import { setRestaurantAverageScoreAndPrice } from '../utils';

export const createUser = async (req: Request<any, any, CreateUserInputValidation['body']>, res: Response) => {
  const { email, firstName, lastName, password } = req.body;

  const userByEmail = await User.findOne({ email });

  if (userByEmail) {
    return res.status(422).send({ message: `Duplicate email!` });
  }

  const data = await User.create({
    firstName,
    lastName,
    email,
    password // Yes, I do save the password as plain text for simplicity
  });

  return res.send({ data });
};

export const getAllUsers = async (_: Request, res: Response) => {
  const data = await User.find().sort('-updatedAt').exec();

  return res.send({ data });
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await User.findById(id);

  if (!data) {
    return res.status(404).send({ message: `User with id "${id}" not found.` });
  }

  return res.send({ data });
};

export const updateUser = async (
  req: Request<{ id: string }, any, UpdateUserInputValidation['body']>,
  res: Response
) => {
  const { id } = req.params;
  const { firstName, lastName } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).send({ message: `User with id "${id}" not found.` });
  }

  await User.findByIdAndUpdate(id, { firstName, lastName });

  const data = await User.findById(id);

  return res.send({ data });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  await User.findByIdAndDelete(id);

  const reviewsByUser = (await Review.find({ userId: id })).map(r => r.id as string);
  const restaurantByReviews = (await Restaurant.find({ reviews: { $in: reviewsByUser } })).map(r => r.id as string);

  await Review.deleteMany({ userId: id });
  await Restaurant.updateMany({ reviews: { $in: reviewsByUser } }, { $pullAll: { reviews: reviewsByUser } });
  await Promise.all(restaurantByReviews.map(setRestaurantAverageScoreAndPrice));

  return res.send({ message: 'User deleted successfully.' });
};
