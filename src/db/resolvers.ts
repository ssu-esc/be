import Album from './models/album';

interface Context {
  uid?: string;
}

const resolvers = {
  Query: {
    albums: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return [];
      const albums = (await Album.findAll({ where: { uid: context.uid } })).map(
        (album: any) => album.dataValues,
      );
      return albums;
    },
  },
  // Mutation: {
  //   addUser: async (_: any, user: { email: String }) => {
  //     return (
  //       await User.create({
  //         email: user.email,
  //       })
  //     ).dataValues;
  //   },
  // },
};

export default resolvers;
