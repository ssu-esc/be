import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Track {
    trackId: String
    title: String
    artist: String
    trackNumber: String
    url: String
  }

  type Album {
    albumId: Int
    title: String
    artist: String
    cover: String
    tracks: [Track]
  }

  type Query {
    albums: [Album]
  }
`;

export default typeDefs;
