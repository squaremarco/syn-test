import mongoose, { Document, Model, Schema } from 'mongoose';
import * as yup from 'yup';

export type UserDocument = Document & {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  likes: string[];
  reviews: string[];
};

export const createUserInputValidation = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    password: yup.string().required()
  })
});

export const updateUserInputValidation = yup.object({
  body: yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().required()
  })
});

const usersSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: Schema.Types.String,
      required: true
    },
    lastName: {
      type: Schema.Types.String,
      required: true
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true
    },
    password: {
      type: Schema.Types.String,
      required: true
    },
    likes: {
      type: [Schema.Types.String],
      default: []
    },
    reviews: {
      type: [Schema.Types.String],
      default: []
    }
  },
  {
    collection: 'users',
    timestamps: true
  }
);

export const User: Model<UserDocument> = mongoose.model<UserDocument>('User', usersSchema);
