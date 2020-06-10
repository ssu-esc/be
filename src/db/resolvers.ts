import Album from './models/album';
import Track from './models/track';

interface Context {
  uid?: string;
}

const resolvers = {
  Query: {
    albums: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return [];
      const albums = (await Album.findAll({ where: { uid: context.uid } })).map(
        (album: { dataValues: Album }) => ({
          ...album.dataValues,
          cover: album.dataValues.hasCover
            ? `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${album.dataValues.albumId}.jpg`
            : 'https://placehold.it/512?text=No%20Image',
        }),
      );
      return albums;
    },
  },
  Album: {
    tracks: async (parent: Album, args: any, context: Context) => {
      const tracks = (
        await Track.findAll({ where: { AlbumAlbumId: parent.albumId } })
      ).map((track: { dataValues: Track }) => ({
        ...track.dataValues,
        url: `https://storage.googleapis.com/storage.musicplayer.cloud/${context.uid}/${track.dataValues.trackId}.mp3`,
      }));

      return tracks;
    },
  },
};

export default resolvers;
