import 'dotenv/config'; // Load environment variables from .env file
import app from './app';
import { env } from './config/env';
import logger from './config/logger';
import prisma from './config/prisma';

app.listen(env.PORT, async () => {
  logger.info(`Server is running on port ${env.PORT}`);
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Failed to connect to the database', error);
    process.exit(1); // Exit the process with an error code
  }
});
