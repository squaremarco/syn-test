import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import * as yup from 'yup';

const paymentTypes = ['cash', 'card', 'voucher'] as const;

export type PaymentType = typeof paymentTypes[number];

export type RestaurantType = {
  name: string;
  averageScore: number;
  averagePrice: number;
  paymentTypes: PaymentType[];
  menuGroups: MenuGroup[];
  pictures: string[];
  tags: string[];
  pinnedReview: Types.ObjectId | null;
  reviews: Types.ObjectId[];
};

export type RestaurantDocument = Document & RestaurantType;

export type MenuGroup = {
  title: string;
  description?: string;
  items?: MenuGroupItem[];
  pinned: boolean;
};

export type MenuGroupItem = {
  label: string;
  price?: number;
};

const menuItemValidationSchema = yup.object({
  label: yup.string().required(),
  price: yup.number().min(0)
});

const menuGroupValidationSchema = yup.object({
  title: yup.string().required(),
  description: yup.string(),
  items: yup.array(menuItemValidationSchema.required()),
  pinned: yup.boolean()
});

const commonRestaurantInputValidation = {
  name: yup.string(),
  paymentTypes: yup
    .array(
      yup
        .string()
        .oneOf([...paymentTypes])
        .required()
    )
    .min(1)
    .distinct(s => s.toLowerCase()),
  pictures: yup.array(yup.string().url().required()),
  menuGroups: yup.array(menuGroupValidationSchema),
  tags: yup
    .array(yup.string().required())
    .min(1)
    .distinct(s => s.toLowerCase())
};

export const createRestaurantInputValidation = yup.object({
  body: yup.object({
    name: commonRestaurantInputValidation.name.required(),
    paymentTypes: commonRestaurantInputValidation.paymentTypes.required(),
    pictures: commonRestaurantInputValidation.pictures,
    menuGroups: commonRestaurantInputValidation.menuGroups,
    tags: commonRestaurantInputValidation.tags.required()
  })
});

export type CreateRestaurantInputValidation = yup.InferType<typeof createRestaurantInputValidation>;

export const updateRestaurantInputValidation = yup.object({
  body: yup.object({ ...commonRestaurantInputValidation, pinnedReview: yup.string().nullable() })
});

export type UpdateRestaurantInputValidation = yup.InferType<typeof updateRestaurantInputValidation>;

const MenuGroupItemSchema = new Schema<MenuGroupItem>(
  {
    label: {
      type: Schema.Types.String,
      required: true
    },
    price: {
      type: Schema.Types.Number
    }
  },
  { _id: false }
);

export const MenuGroupSchema = new Schema<MenuGroup>(
  {
    title: {
      type: Schema.Types.String,
      required: true
    },
    description: {
      type: Schema.Types.String
    },
    items: {
      type: [MenuGroupItemSchema]
    },
    pinned: {
      type: Schema.Types.Boolean,
      default: false
    }
  },
  { _id: false }
);

const restaurantSchema = new Schema<RestaurantDocument>(
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
    menuGroups: {
      type: [MenuGroupSchema],
      default: []
    },
    tags: {
      type: [Schema.Types.String],
      required: true
    },
    pinnedReview: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      default: null
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review'
      }
    ]
  },
  {
    collection: 'restaurants',
    timestamps: true
  }
);

export const Restaurant: Model<RestaurantDocument> = mongoose.model<RestaurantDocument>('Restaurant', restaurantSchema);
