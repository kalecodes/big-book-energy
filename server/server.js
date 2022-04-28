const express = require('express');
const path = require('path');
const db = require('./config/connection');
// only applies to REST API
// const routes = require('./routes');

// Import Apollo Server
import { ApolloServer } from 'apollo-server-express';
// Import authMiddleware
import { authMiddleware } from require('./utils/auth');
// import typeDefs and resolvers for GraphQL
// <-- Add Here -->

const app = express();
const PORT = process.env.PORT || 3001;

// Apply Apollo Server as express middleware
const startServer = async () => {
  // create new Apollo Server and pass in our schema data
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // context method set to return what want available to the resolvers
    // ensures every request performs an auth check
    // updated request object will be passed to resolvers as the context
    context: authMiddleware
  });

  // start the apollo server
  await server.start();
  
  // integrate Apollo server with express app as middleware
  // connect out apollo server to out express server
  // creates special '/graphql' endpoint for the express server
  // endpoint will serve as the main endpoint for accessing the entire API
  server.applyMiddleware({ app });

  // log where we can test our GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
}

// intialize the apollo server
startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// only applies to REST API
// app.use(routes);

// wildcard GET route to respond with production ready front-end code if a request is made to invalid route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
