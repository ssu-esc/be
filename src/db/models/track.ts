import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';

class Track extends Model {
  public trackId!: string;
  public title!: string;
  public artist!: string;
  public trackNumber!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Track.init(
  {
    trackId: {
      type: DataTypes.STRING(15),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(127),
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING(127),
      allowNull: false,
    },
    trackNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { sequelize },
);

export default Track;
