const { gql } = require("apollo-server");

const typeDefs = gql`
  type Mutation {
    addBook(title: String!, published: Int!, author: String!, genres: [String]!): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    specificBooks(genre: String!): [Book!]!
    allGenres: [String!]!
    allAuthors: [Author!]!
    me: User
  }
  type Subscription {
    bookAdded: Book!
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
`;

module.exports = typeDefs;
