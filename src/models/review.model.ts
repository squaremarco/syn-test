import mongoose, { Document, Model, Schema } from 'mongoose';

export type ReviewDocument = Document & {
  userId: string;
  restaurantId: string;
  content: string;
  score: number;
  price?: number;
};

export type ReviewInput = {
  userId: ReviewDocument['userId'];
  restaurantId: ReviewDocument['restaurantId'];
  content: ReviewDocument['content'];
  score: ReviewDocument['score'];
  price?: ReviewDocument['price'];
};

const reviewsSchema = new Schema<ReviewDocument>(
  {
    userId: {
      type: Schema.Types.String,
      required: true
    },
    restaurantId: {
      type: Schema.Types.String,
      required: true
    },
    content: {
      type: Schema.Types.String,
      required: true
    },
    score: {
      type: Schema.Types.Number,
      required: true
    },
    price: {
      type: Schema.Types.Number
    }
  },
  {
    collection: 'reviews',
    timestamps: true
  }
);

export const Review: Model<ReviewDocument> = mongoose.model<ReviewDocument>('Review', reviewsSchema);
