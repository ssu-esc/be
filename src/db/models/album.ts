import {
  Model,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
} from 'sequelize';
import sequelize from '../sequelize';
import Track from './track';

class Album extends Model {
  public albumId!: number;
  public title!: string;
  public artist!: string;
  public uid!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getTracks!: HasManyGetAssociationsMixin<Track>;
  public addTrack!: HasManyAddAssociationMixin<Track, string>;
  public hasTrack!: HasManyHasAssociationMixin<Track, string>;
  public countTracks!: HasManyCountAssociationsMixin;
  public createTrack!: HasManyCreateAssociationMixin<Track>;
}

Album.init(
  {
    albumId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(127),
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING(127),
      allowNull: false,
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize },
);

Album.hasMany(Track);

export default Album;
