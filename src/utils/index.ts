import { Types } from 'mongoose';
import { isEmpty, reduce } from 'ramda';

import { Restaurant } from '../models/restaurant.model';
import { Review } from '../models/review.model';

export const setRestaurantAverageScoreAndPrice = async (id: Types.ObjectId | string) => {
  const reviewsByRestaurant = await Review.find({ restaurant: id });

  if (isEmpty(reviewsByRestaurant)) {
    await Restaurant.findByIdAndUpdate(id, {
      averageScore: 0,
      averagePrice: 0
    });

    return;
  }

  const { totalScore, countScore, totalPrice, countPrice } = reduce(
    (acc, review) => ({
      totalScore: acc.totalScore + review.score,
      countScore: acc.countScore + 1,
      totalPrice: acc.totalPrice + (review.price ?? 0),
      countPrice: review.price ? acc.countPrice + 1 : acc.countPrice
    }),
    {
      totalScore: 0,
      countScore: 0,
      totalPrice: 0,
      countPrice: 0
    },
    reviewsByRestaurant
  );

  await Restaurant.findByIdAndUpdate(id, {
    averageScore: totalScore / countScore,
    averagePrice: countPrice > 0 ? totalPrice / countPrice : 0
  });
};
