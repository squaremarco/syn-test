import mongoose, { Document, Model, Schema } from 'mongoose';

export type ReviewDocument = Document & {
  userId: string;
  placeId: string;
  content: string;
  score: number;
  price?: number;
};

export type ReviewInput = {
  userId: ReviewDocument['userId'];
  placeId: ReviewDocument['placeId'];
  content: ReviewDocument['content'];
  score: ReviewDocument['score'];
  price?: ReviewDocument['price'];
};

const reviewsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.String,
      required: true
    },
    placeId: {
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
