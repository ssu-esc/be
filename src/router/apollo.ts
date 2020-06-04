import { ApolloServer } from 'apollo-server-express';
import { getUID } from '../util/auth';
import typeDefs from '../db/typedefs';
import resolvers from '../db/resolvers';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    uid: await getUID(req.headers.authorization),
  }),
  introspection: true,
  playground: true,
});

export default apolloServer;
