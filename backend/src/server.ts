import 'dotenv/config'; // Load environment variables from .env file
import app from './app';
import { env } from './config/env';
import logger from './config/logger';

app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});
