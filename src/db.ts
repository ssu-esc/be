import { Sequelize } from 'sequelize';
import DotEnv from 'dotenv';

DotEnv.config();

const DB = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    dialectOptions: {
      socketPath: process.env.DB_SOCKET || '',
    },
  },
);

export default DB;
