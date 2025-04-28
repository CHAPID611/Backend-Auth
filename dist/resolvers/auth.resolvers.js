"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const auth_service_1 = require("../services/auth.service");
const user_model_1 = require("../models/user.model");
const authService = new auth_service_1.AuthService();
exports.resolvers = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            return user_model_1.User.findById(user.id);
        },
    },
    Mutation: {
        register: async (_, { input }) => {
            return authService.register(input);
        },
        login: async (_, { input }) => {
            return authService.login(input);
        },
        addToFavorites: async (_, { productId }, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            return authService.addToFavorites(user.id, productId);
        },
        removeFromFavorites: async (_, { productId }, { user }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            return authService.removeFromFavorites(user.id, productId);
        },
    },
    User: {
        __resolveReference: async (reference) => {
            return user_model_1.User.findById(reference.id);
        },
    },
};
