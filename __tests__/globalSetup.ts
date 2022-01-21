import { mongooseConnection } from './common';

export = async () => {
  const { clearDatabase, closeDatabase } = await mongooseConnection();
  await clearDatabase();
  await closeDatabase();
};
