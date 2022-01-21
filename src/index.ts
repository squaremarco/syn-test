import app from './app';
import * as config from './config';
import { connectToDatabase } from './databaseConnection';
import { pinoli } from './pinoms';

const HOST = config.HOST || 'http://localhost';
const PORT = +(config.PORT || '4000');

app.listen(PORT, async () => {
  await connectToDatabase();

  pinoli.info(`Application started on URL ${HOST}:${PORT} 🎉`);
});
