require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const http = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");

const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

const User = require("./schemas/user");

const typeDefs = require("./graphqlschema");
const resolvers = require("./resolvers");

console.log("connecting to", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

// setup is now within a function
const start = async () => {
  try {
    const app = express();
    const httpServer = http.createServer(app);

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const subscriptionServer = SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
      },
      {
        server: httpServer,
        path: "",
      }
    );

    const server = new ApolloServer({
      schema,
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.toLowerCase().startsWith("bearer ")) {
          const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET);
          const currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                subscriptionServer.close();
              },
            };
          },
        },
      ],
    });

    await server.start();

    server.applyMiddleware({
      app,
      path: "/",
    });

    const PORT = 4000;

    httpServer.listen(PORT, () => console.log(`Server is now running on http://localhost:${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

// call the function that does the setup and starts the server
start();
