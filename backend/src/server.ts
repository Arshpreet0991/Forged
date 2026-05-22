import 'dotenv/config'; // Load environment variables from .env file
import app from './app';
import { env } from './config/env';
import logger from './config/logger';
import prisma from './config/prisma';

app.listen(env.PORT, async () => {
  logger.info(`Server is running on port ${env.PORT}`);
  await prisma.$connect();
  logger.info('Connected to the database');
});
