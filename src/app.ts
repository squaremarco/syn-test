import './yupExtension';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request } from 'express';
import jwt from 'express-jwt';

import * as config from './config';
import { errorHandler } from './middlewares';
import { restaurantRoute } from './routes/restaurant.route';
import { reviewRoute } from './routes/review.route';
import { userRoute } from './routes/user.route';

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  jwt({
    secret: config.TOKEN!,
    algorithms: ['HS256'],
    requestProperty: 'scopedInfo',
    getToken: (req: Request) => {
      if (req.headers?.authorization?.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
      }
      return null;
    }
  }).unless({
    path: [
      '/',
      '/signin',
      '/signup',
      { url: /^\/restaurants.*/, methods: ['GET'] },
      { url: /^\/users.*/, methods: ['GET'] },
      { url: /^\/reviews.*/, methods: ['GET'] }
    ]
  })
);

app.use('/', restaurantRoute());
app.use('/', reviewRoute());
app.use('/', userRoute());
app.get('/', (_, res) => res.send({ message: 'Hello, Synesthesia!' }));

app.use(errorHandler);

export default app;
