import mongoose, { Document, Model, Schema } from 'mongoose';
import * as yup from 'yup';

export type ReviewDocument = Document & {
  user: string;
  restaurant: string;
  content: string;
  score: number;
  price?: number;
};

const commonInputValidation = {
  content: yup.string().required(),
  score: yup.number().min(0).max(10).required(),
  price: yup.number().min(0)
};

export const createReviewInputValidation = yup.object({
  body: yup.object({
    ...commonInputValidation,
    user: yup.string().required(),
    restaurant: yup.string().required()
  })
});

export type CreateReviewInputValidation = yup.InferType<typeof createReviewInputValidation>;

export const updateReviewInputValidation = yup.object({
  body: yup.object(commonInputValidation)
});

export type UpdateReviewInputValidation = yup.InferType<typeof updateReviewInputValidation>;

const reviewsSchema = new Schema<ReviewDocument>(
  {
    user: {
      type: Schema.Types.String,
      ref: 'User',
      required: true
    },
    restaurant: {
      type: Schema.Types.String,
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
