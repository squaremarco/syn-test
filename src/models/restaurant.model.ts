import mongoose, { Document, Model, Schema } from 'mongoose';

const paymentTypes = ['cash', 'card', 'voucher'] as const;

export type PaymentType = typeof paymentTypes[number];

export type RestaurantDocument = Document & {
  name: string;
  averageScore: number;
  averagePrice: number;
  paymentTypes: PaymentType[];
  pictures: string[];
  tags: string[];
  pinnedReview: string | null;
  reviews: string[];
};

export type RestaurantInput = {
  name: string;
  paymentTypes: PaymentType[];
  tags: string[];
  pictures?: string[];
};

const restaurantSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true
    },
    averageScore: {
      type: Schema.Types.Number,
      min: 0,
      max: 10,
      default: 0
    },
    averagePrice: {
      type: Schema.Types.Number,
      min: 0,
      default: 0
    },
    paymentTypes: {
      type: [Schema.Types.String],
      enum: paymentTypes,
      required: true
    },
    pictures: {
      type: [Schema.Types.String],
      default: []
    },
    tags: {
      type: [Schema.Types.String],
      required: true
    },
    pinnedReview: {
      type: Schema.Types.String,
      default: null
    },
    reviews: {
      type: [Schema.Types.String],
      default: []
    }
  },
  {
    collection: 'restaurants',
    timestamps: true
  }
);

export const Restaurant: Model<RestaurantDocument> = mongoose.model<RestaurantDocument>('Restaurant', restaurantSchema);
