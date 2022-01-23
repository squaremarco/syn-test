import mongoose, { Document, Model, Schema } from 'mongoose';
import * as yup from 'yup';

const roles = ['admin', 'user'] as const;

export type RolesType = typeof roles[number];

export type UserType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: RolesType[];
  likes: string[];
  reviews: string[];
};

export type UserDocument = Document & UserType;

const baseUserInputValidation = {
  firstName: yup.string(),
  lastName: yup.string(),
  roles: yup
    .array(
      yup
        .string()
        .oneOf([...roles])
        .required()
    )
    .min(1)
    .distinct(s => s.toLowerCase()),
  password: yup.string()
};

export const signupInputValidation = yup.object({
  body: yup.object({
    firstName: baseUserInputValidation.firstName.required(),
    lastName: baseUserInputValidation.lastName.required(),
    roles: baseUserInputValidation.roles.required(),
    password: baseUserInputValidation.password.required(),
    email: yup.string().email().required()
  })
});

export type SignupInputValidation = yup.InferType<typeof signupInputValidation>;

export const signinInputValidation = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: baseUserInputValidation.password.required()
  })
});

export type SigninInputValidation = yup.InferType<typeof signinInputValidation>;

export const updateUserInputValidation = yup.object({
  body: yup.object(baseUserInputValidation)
});

export type UpdateUserInputValidation = yup.InferType<typeof updateUserInputValidation>;

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
    roles: {
      type: [Schema.Types.String],
      enum: roles,
      required: true
    },
    likes: {
      type: [Schema.Types.String],
      ref: 'Restaurant',
      default: []
    },
    reviews: {
      type: [Schema.Types.String],
      ref: 'Review',
      default: []
    }
  },
  {
    collection: 'users',
    timestamps: true
  }
);

export const User: Model<UserDocument> = mongoose.model<UserDocument>('User', usersSchema);
