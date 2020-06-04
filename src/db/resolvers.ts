import { User } from '.';

interface Context {
  uid?: string;
}

const resolvers = {
  Query: {
    users: async (parent: any, args: any, context: Context) => {
      if (!context.uid) return [];
      const users = (await User.findAll()).map((user: any) => user.dataValues);
      return users;
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
