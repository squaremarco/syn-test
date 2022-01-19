import mongoose from 'mongoose';

import * as CF from './config';

export const connectToDatabase = () => mongoose.connect(`mongodb://${CF.DB_HOST}:${CF.DB_PORT}/${CF.DB_NAME}`);
