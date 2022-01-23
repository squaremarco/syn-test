import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import * as yup from 'yup';

export type ReviewType = {
  user: Types.ObjectId;
  restaurant: Types.ObjectId;
  content: string;
  score: number;
  price?: number;
};

export type ReviewDocument = Document & ReviewType;

const baseInputValidation = {
  content: yup.string().required(),
  score: yup.number().min(0).max(10).required(),
  price: yup.number().min(0)
};

export const createReviewInputValidation = yup.object({
  body: yup.object({
    content: baseInputValidation.content.required(),
    score: baseInputValidation.score.required(),
    price: baseInputValidation.price,
    restaurant: yup.string().required()
  })
});

export type CreateReviewInputValidation = yup.InferType<typeof createReviewInputValidation>;

export const updateReviewInputValidation = yup.object({
  body: yup.object(baseInputValidation)
});

export type UpdateReviewInputValidation = yup.InferType<typeof updateReviewInputValidation>;

const reviewsSchema = new Schema<ReviewDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    content: {
      type: Schema.Types.String,
      required: true
    },
    score: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
      max: 10
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
