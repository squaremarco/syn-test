import './yupExtension';

import express from 'express';

import * as config from './config';
import { connectToDatabase } from './databaseConnection';
import { pinoli } from './pinoms';
import { restaurantRoute } from './routes/restaurant.route';
import { reviewRoute } from './routes/review.route';
import { userRoute } from './routes/user.route';

const HOST = config.HOST || 'http://localhost';
const PORT = +(config.PORT || '4000');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', restaurantRoute());
app.use('/', reviewRoute());
app.use('/', userRoute());

app.get('/', (_, res) => res.json({ message: 'Syn-Node-Test!' }));

app.listen(PORT, async () => {
  await connectToDatabase();

  pinoli.info(`Application started on URL ${HOST}:${PORT} 🎉`);
});
