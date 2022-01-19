import mongoose, { Document, Model, Schema } from 'mongoose';

export type UserDocument = Document & {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  likes: string[];
  reviews: string[];
};

export type UserInput = {
  firstName: UserDocument['firstName'];
  lastName: UserDocument['lastName'];
  email: UserDocument['email'];
  password: UserDocument['password'];
};

const usersSchema = new Schema(
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
