import { Sequelize } from 'sequelize';
import DotEnv from 'dotenv';
import Logger from '../util/logger';

DotEnv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    dialect: 'mysql',
    logging: (msg) => Logger.debug(msg, { label: 'Sequelize' }),
    host: process.env.DB_HOST,
    dialectOptions: {
      socketPath: process.env.DB_SOCKET || '',
    },
  },
);

sequelize.sync({ logging: (msg) => Logger.debug(msg, { label: 'Sequelize' }) });

export default sequelize;
