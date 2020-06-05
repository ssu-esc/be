import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Album {
    albumId: Int
    title: String
    artist: String
  }

  type Query {
    albums: [Album]
  }
`;

export default typeDefs;
