import { gql } from 'apollo-server-express';

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

export default typeDefs;
