import { gql } from 'apollo-server-express';
import { User } from './db';

interface Context {
  uid?: string;
}

const typeDefs = gql`
  type User {
    uid: Int
    email: String
  }

  type Query {
    users: [User]
  }

  # type Mutation {
  #   addUser(email: String!): User
  # }
`;

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

export { typeDefs, resolvers };
