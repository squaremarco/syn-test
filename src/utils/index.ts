import { Restaurant } from '../models/restaurant.model';
import { Review } from '../models/review.model';

export const calculateScoreAndPrice = async (id: string) => {
  const reviewsByRestaurant = await Review.find({ restaurantId: id });

  const { totalScore, countScore, totalPrice, countPrice } = reviewsByRestaurant.reduce(
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
    }
  );

  await Restaurant.findByIdAndUpdate(id, {
    averageScore: totalScore / countScore,
    averagePrice: totalPrice / countPrice
  });
};
