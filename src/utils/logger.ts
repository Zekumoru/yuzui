import pino from 'pino';
import pretty from 'pino-pretty';

export default pino(
  pretty({
    colorize: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss.l',
  })
);
