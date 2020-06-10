import { ApolloServer } from 'apollo-server-express';

import typeDefs from '../db/typedefs';
import resolvers from '../db/resolvers';
import { AuthRequest } from '../types';
import { getUser } from '../util/auth';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }: { req: AuthRequest }) => ({
    uid: getUser(req),
  }),
  introspection: true,
  playground: true,
});

export default apolloServer;
