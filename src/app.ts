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

app
  .use(cookieParser())
  .use(cors())
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(
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
  )
  .use('/', restaurantRoute())
  .use('/', reviewRoute())
  .use('/', userRoute())
  .get('/', (_, res) => res.send({ message: 'Hello, Synesthesia!' }))
  .use(errorHandler);

export default app;
