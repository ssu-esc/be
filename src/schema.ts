import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }

  type Mutation {
    addBook(title: String!, author: String!): Book
  }
`;

const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const resolvers = {
  Query: {
    books: () => books,
  },
  Mutation: {
    addBook: (_: any, book: { title: string; author: string }) => {
      books.push(book);
      return book;
    },
  },
};

export { typeDefs, resolvers };
