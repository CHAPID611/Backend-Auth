"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql) `
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type User @key(fields: "id") {
    id: ID!
    email: String! @shareable
    firstName: String! @shareable
    lastName: String! @shareable
    role: String! @shareable
    favorites: [ID!]! @shareable
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    addToFavorites(productId: ID!): User!
    removeFromFavorites(productId: ID!): User!
  }
`;
