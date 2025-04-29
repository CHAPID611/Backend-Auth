import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import mongoose from 'mongoose';
import { typeDefs } from './schemas/auth.schema';
import { resolvers } from './resolvers/auth.resolvers';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { json } from 'body-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 4001;

// Connect to MongoDB
// Update MongoDB connection options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-db', {
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 15000, // Increase timeout
  socketTimeoutMS: 45000,          // Increase socket timeout
  connectTimeoutMS: 15000,         // Connection timeout
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Context function to handle authentication
const getUser = (token: string) => {
  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    }
    return null;
  } catch (error) {
    return null;
  }
};

interface MyContext {
  user: any;
}

// Add this before starting Apollo Server
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

async function startServer() {
  const server = new ApolloServer<MyContext>({
    schema: buildSubgraphSchema([
      { typeDefs, resolvers }
    ])
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        const user = token ? getUser(token.replace('Bearer ', '')) : null;
        return { user };
      },
    })
  );

  app.listen(port, () => {
    console.log(`🚀 Auth service ready at http://localhost:${port}/graphql`);
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
