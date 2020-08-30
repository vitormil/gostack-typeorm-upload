import app from './app';
import logger from './logger';

app.listen(3333, () => {
  logger.info('🚀 Server started on port 3333!');
});
