import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { isNil, map, omit } from 'ramda';

import * as config from '../config';
import { Restaurant } from '../models/restaurant.model';
import { Review } from '../models/review.model';
import { SigninInputValidation, SignupInputValidation, UpdateUserInputValidation, User } from '../models/user.model';
import { setRestaurantAverageScoreAndPrice } from '../utils';

export const signup = async (req: Request<any, any, SignupInputValidation['body']>, res: Response) => {
  const { email, firstName, lastName, password, roles } = req.body;

  const userByEmail = await User.findOne({ email });

  if (!isNil(userByEmail)) {
    return res.status(422).send({ message: `Duplicate email!` });
  }

  const data = await User.create({
    firstName,
    lastName,
    email,
    roles,
    password: bcrypt.hashSync(password)
  });

  return res.send({ data: omit(['password'], data) });
};

export const signin = async (req: Request<any, any, SigninInputValidation['body']>, res: Response) => {
  const { email, password } = req.body;

  const userByEmail = await User.findOne({ email });

  if (isNil(userByEmail)) {
    return res.status(404).send({ message: `User with email "${email}" not found.` });
  }
  const passwordIsValid = bcrypt.compareSync(password, userByEmail.password);

  if (!passwordIsValid) {
    return res.status(401).send({ message: 'Invalid Password!' });
  }

  const accessToken = jwt.sign(
    {
      id: userByEmail._id,
      email: userByEmail.email,
      roles: userByEmail.roles
    },
    config.TOKEN!,
    { expiresIn: '24h' }
  );

  const data = {
    accessToken
  };

  return res.header('authorization', accessToken).send({ data });
};

export const getAllUsers = async (_: Request, res: Response) => {
  const data = await User.find().sort('-updatedAt').populate(['likes', 'reviews']).lean();

  return res.send({ data: map(omit(['password']), data) });
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await User.findById(id).populate(['likes', 'reviews']).lean();

  if (isNil(data)) {
    return res.status(404).send({ message: `User with id "${id}" not found.` });
  }

  return res.send({ data: omit(['password'], data) });
};

export const updateUser = async (
  req: Request<{ id: string }, any, UpdateUserInputValidation['body']>,
  res: Response
) => {
  const { id } = req.params;
  const { id: userId } = req.scopedInfo!;
  const { firstName, lastName, password, roles } = req.body;

  if (id !== userId) {
    return res.status(422).send({ message: `Can't update another user information.` });
  }

  const user = await User.findById(id).lean();

  if (isNil(user)) {
    return res.status(404).send({ message: `User with id "${id}" not found.` });
  }

  await User.findByIdAndUpdate(id, {
    firstName: firstName ?? user.firstName,
    lastName: lastName ?? user.lastName,
    password: password ? bcrypt.hashSync(password, 48) : user.password,
    roles: roles ?? user.roles
  });

  const data = await User.findById(id).lean();

  return res.send({ data });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  await User.findByIdAndDelete(id);

  const reviewsByUser = (await Review.find({ user: id })).map(r => r._id);
  const restaurantByReviews = (await Restaurant.find({ reviews: { $in: reviewsByUser } })).map(r => r._id);

  await Review.deleteMany({ user: id });
  await Restaurant.updateMany({ reviews: { $in: reviewsByUser } }, { $pullAll: { reviews: reviewsByUser } });
  await Promise.all(restaurantByReviews.map(setRestaurantAverageScoreAndPrice));

  return res.send({ message: 'User deleted successfully.' });
};
