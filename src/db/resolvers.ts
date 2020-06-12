import Album from './models/album';
import Track from './models/track';

interface Context {
  uid?: string;
}

const resolvers = {
  Query: {
    albums: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return [];
      const albums = (
        await Album.findAll({
          where: { uid: context.uid },
          order: [
            ['artist', 'ASC'],
            ['title', 'ASC'],
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
