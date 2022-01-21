import mongoose from 'mongoose';
import { values } from 'ramda';

import { connectToDatabase } from '../src/databaseConnection';

export const mongooseConnection = async () => {
  await connectToDatabase();

  return {
    mongoose,
    clearDatabase: () => Promise.all(values(mongoose.connection.collections).map(c => c.deleteMany({}))),
    closeDatabase: async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  };
};
