import express from 'express';

import * as CF from './config';
import * as DB from './databaseConnection';
import * as P from './pinoms';
import * as RW from './routes/review.route';
import * as US from './routes/user.route';

const HOST = CF.HOST || 'http://localhost';
const PORT = +(CF.PORT || '4000');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', US.userRoute());
app.use('/', RW.reviewRoute());

app.get('/', (_, res) => res.json({ message: 'Syn-Test-NoSQL!' }));

app.listen(PORT, async () => {
  await DB.connectToDatabase();

  P.pinoli.info(`Application started on URL ${HOST}:${PORT} 🎉`);
});