import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

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
    albumArtist: String
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
    album(albumId: Int!): Album
    albums: [Album]
    artist(name: String!): Artist
    artists: [Artist]
    track(trackId: String!): ExtendedTrack
    tracks: [ExtendedTrack]
  }

  type Mutation {
    removeAlbum(albumId: Int!): Int
    removeTrack(trackId: String!): String
  }
`;

export default typeDefs;
