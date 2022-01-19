import { Request, Response } from 'express';

import { Review, ReviewInput } from '../models/review.model';
import { User } from '../models/user.model';

export const createReview = async (req: Request, res: Response) => {
  const { userId, placeId, content, score, price } = req.body;

  if (!userId || !placeId || !content || !score) {
    return res.status(422).json({ message: 'The fields userId, placeId, content and score are required' });
  }

  const user = await User.findById(userId);
  // TODO get place

  if (!user) {
    // check that both user and place exist
    return res.status(404).json({ message: `User with id "${userId}" not found.` });
  }

  const data = await Review.create<ReviewInput>({ content, score, price, userId, placeId });

  await User.findByIdAndUpdate(userId, { $push: { reviews: data.id } });
  // TODO push review id to place

  return res.status(201).json({ data });
};

export const getAllReviews = async (_: Request, res: Response) => {
  const data = await Review.find().sort('-updatedAt').exec();

  return res.status(200).json({ data });
};

export const getReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await Review.findById(id);

  if (!data) {
    return res.status(404).json({ message: `Review with id "${id}" not found.` });
  }

  return res.status(200).json({ data });
};

export const updateReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, score, price } = req.body;

  const review = await Review.findById(id);

  if (!review) {
    return res.status(404).json({ message: `Review with id "${id}" not found.` });
  }

  if (!content || !score) {
    return res.status(422).json({ message: 'The fields content and score are required' });
  }

  await Review.findByIdAndUpdate(id, { content, score, price });

  const data = await Review.findById(id);

  return res.status(200).json({ data });
};

export const deleteReview = async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    return res.status(404).json({ message: `Review with id "${id}" not found.` });
  }

  await Review.findByIdAndDelete(id);
  await User.findByIdAndUpdate(review.userId, { $pull: { reviews: id } });

  // TODO pull review from place
  // TODO recalculate score and average price

  return res.status(200).json({ message: 'Review deleted successfully.' });
};
