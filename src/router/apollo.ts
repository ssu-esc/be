import { ApolloServer } from 'apollo-server-express';
import typeDefs from '../db/typedefs';
import resolvers from '../db/resolvers';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: { req: AuthRequest }) => ({
    uid: req.user?.sub || '',
  }),
  introspection: true,
  playground: true,
});

export default apolloServer;
