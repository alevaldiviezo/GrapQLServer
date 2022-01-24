//include express module or package
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const models = require('./models');
const db = require('./db')
const jwt = require('jsonwebtoken');



require('dotenv').config();

//const port = 4000;
const port = process.env.PORT
console.log({port})

// GraphQL's schema ‘Query’
const typeDefs = require('./schema');
// create resolver functions for Query schema
const resolvers = require('./resolvers');

// GraphQL's schema ‘Query’
// const typeDefs = gql`
//  type Query {
//     hello: String
//  }
// `;

//Create resolver functions for Query schema
// const resolvers = {
//     Query: {
//        hello: () => 'Hello world!'
//     }
// };

//create instance of express
const app = express();

// Connect to the database
const MONGO_HOSTNAME = process.env.MONGO_HOSTNAME;
const MONGO_PORT = process.env.MONGO_PORT;
const MONGO_DB = process.env.MONGO_DB;
const DB_URL = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`

db.connect(DB_URL);


// get the user info from a JWT
const getUser = token => {
    if (token) {
        try {
            // return the user information from the token
            return jwt.verify(token, process.env.JWT_SECRET);        
         } catch (err) {
            // if there's a problem with the token, throw an error
            throw new Error('Session invalid');
        }
    }
};    

//Create an instance of Apollo Server
const server = new ApolloServer({ 
   typeDefs, 
   resolvers,
   context: ({ req }) => {
      // get the user token from the headers
       const token = req.headers.authorization;        
       // try to retrieve a user with the token
       const user = getUser(token);        
       // for now, let's log the user to the console:
       console.log(user);        
       // add the db models and the user to the context
       return { models, user };
   }
});


//Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => res.send('Hello World'));

app.listen({port}, () => 
console.log(`Server running at http://localhost:${port}!`));