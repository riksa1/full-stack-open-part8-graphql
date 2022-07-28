const { UserInputError, AuthenticationError } = require("apollo-server");
const Author = require("./schemas/author");
const Book = require("./schemas/book");
const User = require("./schemas/user");
const { v1: uuid } = require("uuid");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const resolvers = {
  Query: {
    bookCount: async () => {
      return (await Book.find({})).length;
    },
    authorCount: async () => {
      return (await Author.find({})).length;
    },
    allBooks: async (root, { author, genre }) => {
      const books = await Book.find({}).populate("author");
      if (author && genre) {
        return books.filter((book) => book.author.name === author && book.genres.includes(genre));
      } else if (author) {
        return books.filter((book) => book.author.name === author);
      } else if (genre) {
        return books.filter((book) => book.genres.includes(genre));
      } else {
        return books;
      }
    },
    specificBooks: async (root, { genre }) => {
      if (genre === "all") {
        const books = await Book.find({}).populate("author");
        return books;
      } else {
        const books = await Book.find({ genres: genre }).populate("author");
        return books;
      }
    },
    allGenres: async () => {
      const books = await Book.find({}).populate("author");
      const genres = [];
      for (let i = 0; i < books.length; i++) {
        for (let j = 0; j < books[i].genres.length; j++) {
          if (!genres.includes(books[i].genres[j])) {
            genres.push(books[i].genres[j]);
          }
        }
      }
      return genres;
    },
    allAuthors: async () => {
      const authors = await Author.find({});
      const books = await Book.find({}).populate("author");
      const Authors = authors.map((author) => ({
        name: author.name,
        born: author.born,
        bookCount: books.filter((b) => b.author.name === author.name).length,
      }));
      return Authors;
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, { title, published, genres, author }, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      const authors = await Author.find({});
      if (title.length < 2) {
        throw new UserInputError("Book title is too short");
      }
      if (author.length < 4) {
        throw new UserInputError("Author name is too short");
      }
      const oldBook = await Book.findOne({ title: title });
      if (oldBook) {
        throw new UserInputError("Book with that name already exists");
      }
      const book = new Book({ title: title, published: published, genres: genres, id: uuid() });
      if (!authors.some((e) => e.name === author)) {
        const newAuthor = new Author({ name: author, id: uuid() });
        book.author = newAuthor._id;
        await newAuthor.save();
      } else {
        const usedAuthor = authors.filter((obj) => {
          return obj.name === author;
        });
        book.author = usedAuthor[0]._id;
      }
      await book.save();
      await book.populate("author");
      pubsub.publish("BOOK_ADDED", { bookAdded: book });
      return book;
      WW;
    },
    editAuthor: async (root, { name, setBornTo }, context) => {
      try {
        const currentUser = context.currentUser;

        if (!currentUser) {
          throw new AuthenticationError("not authenticated");
        }

        const authors = await Author.find({});
        if (!authors.some((e) => e.name === name)) {
          return null;
        } else {
          const author = await Author.findOne({ name: name });
          author.born = setBornTo;
          await author.save();
          return author;
        }
      } catch (error) {
        console.log(error);
      }
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, id: uuid(), favoriteGenre: args.favoriteGenre });

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET), favorite: user.favoriteGenre };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
