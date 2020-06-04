import { createLogger, transports, format } from 'winston';

const { combine, timestamp, label, colorize, printf, splat } = format;

const Logger = createLogger({
  format: combine(
    colorize(),
    label(),
    splat(),
    timestamp({
      format: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    }),
    printf((info) => {
      return `${info.timestamp} [${info.label} ${info.level}] : ${info.message}`;
    }),
  ),
  transports: [new transports.Console({})],
});

export default Logger;
