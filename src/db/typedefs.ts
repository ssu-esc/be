import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Track {
    artist: String
    title: String
    trackId: String
    trackNumber: String
    url: String
  }

  type ExtendedTrack {
    album: String
    albumId: Int
    artist: String
    cover: String
    title: String
    trackId: String
    trackNumber: Int
    url: String
  }

  type Album {
    albumId: Int
    artist: String
    cover: String
    title: String
    tracks: [Track]
  }

  type Artist {
    albums: [Album]
    name: String
  }

  type Query {
    albums: [Album]
    artists: [Artist]
    tracks: [ExtendedTrack]
  }
`;

export default typeDefs;
