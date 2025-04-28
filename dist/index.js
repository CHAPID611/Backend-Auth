"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const subgraph_1 = require("@apollo/subgraph");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_schema_1 = require("./schemas/auth.schema");
const auth_resolvers_1 = require("./resolvers/auth.resolvers");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4001;
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-db')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
// Context function to handle authentication
const getUser = (token) => {
    try {
        if (token) {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        }
        return null;
    }
    catch (error) {
        return null;
    }
};
// Create Apollo Server
const server = new apollo_server_express_1.ApolloServer({
    schema: (0, subgraph_1.buildSubgraphSchema)([{ typeDefs: auth_schema_1.typeDefs, resolvers: auth_resolvers_1.resolvers }]),
    context: ({ req }) => {
        const token = req.headers.authorization || '';
        const user = getUser(token.replace('Bearer ', ''));
        return { user };
    },
});
async function startServer() {
    await server.start();
    server.applyMiddleware({ app });
    app.listen(port, () => {
        console.log(`🚀 Auth service ready at http://localhost:${port}${server.graphqlPath}`);
    });
}
startServer().catch(error => {
    console.error('Error starting server:', error);
});
