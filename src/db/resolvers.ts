import Album from './models/album';
import Track from './models/track';
import { remove, copy } from '../util/storage';

interface Context {
  uid?: string;
}

const resolvers = {
  Query: {
    album: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return null;
      const album = await Album.findOne({
        where: {
          albumId: args.albumId,
          uid: context.uid,
        },
      });
      if (!album) return null;
      return {
        ...album.dataValues,
        cover: album.dataValues.hasCover
          ? `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${album.dataValues.albumId}.jpg`
          : 'https://placehold.it/512?text=No%20Image',
      };
    },
    albums: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return [];
      const albums = (
        await Album.findAll({
          where: { uid: context.uid },
          order: [
            ['title', 'ASC'],
            ['artist', 'ASC'],
          ],
        })
      ).map((album: { dataValues: Album }) => ({
        ...album.dataValues,
        cover: album.dataValues.hasCover
          ? `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${album.dataValues.albumId}.jpg`
          : 'https://placehold.it/512?text=No%20Image',
      }));
      return albums;
    },
    artist: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return null;
      const albums = await Album.count({
        where: {
          uid: context.uid,
          artist: args.name,
        },
      });
      return albums > 0 ? { name: args.name } : null;
    },
    artists: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return [];
      const artist = (
        await Album.findAll({
          attributes: ['artist'],
          where: { uid: context.uid },
          group: 'artist',
          order: [['artist', 'ASC']],
        })
      ).map((album: { dataValues: Album }) => ({
        name: album.dataValues.artist,
      }));
      return artist;
    },
    track: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return [];
      const album = await Album.findOne({
        where: { uid: context.uid },
        order: [
          ['artist', 'ASC'],
          ['title', 'ASC'],
        ],
        include: [
          {
            model: Track,
            attributes: ['trackId', 'title', 'artist', 'trackNumber'],
            where: {
              trackId: args.trackId,
            },
          },
        ],
      });
      const track = album.Tracks[0].dataValues;
      return {
        album: album.dataValues.title,
        albumId: album.dataValues.albumId,
        artist: track.artist,
        albumArtist: album.dataValues.artist,
        cover: album.dataValues.hasCover
          ? `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${album.dataValues.albumId}.jpg`
          : 'https://placehold.it/512?text=No%20Image',
        title: track.title,
        trackId: track.trackId,
        trackNumber: track.trackNumber,
        url: `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${track.trackId}.mp3`,
      };
    },
    tracks: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return [];
      const tracks = await Album.findAll({
        where: { uid: context.uid },
        order: [
          ['artist', 'ASC'],
          ['title', 'ASC'],
          [Track, 'trackNumber', 'ASC'],
        ],
        include: [
          {
            model: Track,
            attributes: ['trackId', 'title', 'artist', 'trackNumber'],
          },
        ],
      })
        .map((album: any) => {
          return album.dataValues.Tracks.map(
            (track: { dataValues: Track }) => ({
              album: album.dataValues.title,
              albumId: album.dataValues.albumId,
              albumArtist: album.dataValues.artist,
              artist: track.dataValues.artist,
              cover: album.dataValues.hasCover
                ? `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${album.dataValues.albumId}.jpg`
                : 'https://placehold.it/512?text=No%20Image',
              title: track.dataValues.title,
              trackId: track.dataValues.trackId,
              trackNumber: track.dataValues.trackNumber,
              url: `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${track.dataValues.trackId}.mp3`,
            }),
          );
        })
        .reduce(
          (accumulator: any, currentValue: any) =>
            accumulator.concat(currentValue),
          [],
        );
      return tracks;
    },
  },
  Mutation: {
    updateAlbum: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return null;
      const { uid } = context;
      const { albumId, artist, title } = args;
      const album = await Album.findOne({ where: { albumId, uid } });
      if (!album) return null;
      const targetAlbum = await Album.findOne({
        where: { artist, title, uid },
      });
      if (!targetAlbum) {
        album.update({ artist, title });
        return album.dataValues;
      }

      if (targetAlbum.dataValues.albumId === albumId) {
        return album.dataValues;
      }
      const targetAlbumId = targetAlbum.dataValues.albumId;
      await Track.update(
        { AlbumAlbumId: targetAlbumId },
        { where: { AlbumAlbumId: albumId } },
      );
      if (album.dataValues.hasCover && !targetAlbum.dataValues.hasCover) {
        copy(`${uid}/${albumId}.jpg`, `${uid}/${targetAlbumId}.jpg`);
        targetAlbum.update({ hasCover: true });
      }
      await album.destroy();
      await remove(`${uid}/${albumId}.jpg`);
      return targetAlbum.dataValues;
    },
    updateTrack: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return null;
      const { uid } = context;
      const { trackId, album, albumArtist, artist, title, trackNumber } = args;
      const track = await Track.findByPk(trackId);
      const trackAlbum = await Album.findOne({
        where: {
          uid,
          albumId: track.dataValues.AlbumAlbumId,
        },
      });
      await track.update({ artist, title, trackNumber });
      if (
        trackAlbum.dataValues.artist !== albumArtist ||
        trackAlbum.dataValues.title !== album
      ) {
        const targetAlbum = await Album.findOrCreate({
          where: {
            title: album,
            artist: albumArtist,
            uid,
          },
        });
        await track.update({ AlbumAlbumId: targetAlbum[0].dataValues.albumId });
        if (
          trackAlbum.dataValues.hasCover &&
          !targetAlbum[0].dataValues.hasCover
        ) {
          await copy(
            `${uid}/${trackAlbum.dataValues.albumId}.jpg`,
            `${uid}/${targetAlbum[0].dataValues.albumId}.jpg`,
          );
          await targetAlbum.update({ hasCover: true });
        }
        if (
          (await Track.count({
            where: { AlbumAlbumId: trackAlbum.dataValues.albumId },
          })) === 0
        ) {
          await remove(`${uid}/${trackAlbum.dataValues.albumId}.jpg`);
          await trackAlbum.destroy();
        }
        return {
          album: targetAlbum[0].dataValues.title,
          albumId: targetAlbum[0].dataValues.albumId,
          albumArtist: targetAlbum[0].dataValues.artist,
          artist: track.dataValues.artist,
          cover: targetAlbum[0].dataValues.hasCover
            ? `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${targetAlbum[0].dataValues.albumId}.jpg`
            : 'https://placehold.it/512?text=No%20Image',
          title: track.dataValues.title,
          trackId: track.dataValues.trackId,
          trackNumber: track.dataValues.trackNumber,
          url: `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${track.dataValues.trackId}.mp3`,
        };
      }
      return {
        album: trackAlbum.dataValues.title,
        albumId: trackAlbum.dataValues.albumId,
        albumArtist: trackAlbum.dataValues.artist,
        artist: track.dataValues.artist,
        cover: trackAlbum.dataValues.hasCover
          ? `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${trackAlbum.dataValues.albumId}.jpg`
          : 'https://placehold.it/512?text=No%20Image',
        title: track.dataValues.title,
        trackId: track.dataValues.trackId,
        trackNumber: track.dataValues.trackNumber,
        url: `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${track.dataValues.trackId}.mp3`,
      };
    },
    removeTrack: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return null;
      const { uid } = context;
      const track = await Track.findByPk(args.trackId);
      const albumId = track.dataValues.AlbumAlbumId;
      await track.destroy();
      await remove(`${uid}/${args.trackId}.mp3`);
      const trackCount = await Track.count({
        where: { AlbumAlbumId: albumId },
      });
      if (trackCount === 0) {
        const album = await Album.findOne({
          where: { albumId, uid },
        });
        await album.destroy();
        await remove(`${uid}/${albumId}.jpg`);
      }
      return args.trackId;
    },
    removeAlbum: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return null;
      const { uid } = context;
      const album = await Album.findOne({
        where: {
          albumId: args.albumId,
          uid,
        },
        include: [
          {
            model: Track,
          },
        ],
      });
      await remove(`${uid}/${args.albumId}.jpg`);
      album.Tracks.forEach(async (track: any) => {
        await remove(`${uid}/${track.dataValues.trackId}.mp3`);
      });
      await album.destroy();
      return args.albumId;
    },
  },
  Album: {
    tracks: async (parent: Album, args: any, context: Context) => {
      const tracks = (
        await Track.findAll({
          where: { AlbumAlbumId: parent.albumId },
          order: [['trackNumber', 'ASC']],
        })
      ).map((track: { dataValues: Track }) => ({
        ...track.dataValues,
        url: `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${track.dataValues.trackId}.mp3`,
      }));

      return tracks;
    },
  },
  Artist: {
    albums: async (parent: { name: string }, args: any, context: Context) => {
      if (!context.uid) return [];
      const albums = (
        await Album.findAll({
          where: { uid: context.uid, artist: parent.name },
          order: [['title', 'ASC']],
        })
      ).map((album: { dataValues: Album }) => ({
        ...album.dataValues,
        cover: album.dataValues.hasCover
          ? `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${album.dataValues.albumId}.jpg`
          : 'https://placehold.it/512?text=No%20Image',
      }));
      return albums;
    },
  },
};

export default resolvers;
