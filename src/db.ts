import { Sequelize, Model, DataTypes } from 'sequelize';
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

class User extends Model {}

User.init(
  {
    uid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { sequelize: DB },
);

export { User };
export default DB;
