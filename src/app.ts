import './yupExtension';

import express from 'express';

import { restaurantRoute } from './routes/restaurant.route';
import { reviewRoute } from './routes/review.route';
import { userRoute } from './routes/user.route';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', restaurantRoute());
app.use('/', reviewRoute());
app.use('/', userRoute());

app.get('/', (_, res) => res.send({ message: 'Hello, Synesthesia!' }));

export default app;
