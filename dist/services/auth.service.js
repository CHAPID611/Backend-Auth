"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }
    async register(input) {
        const existingUser = await user_model_1.User.findOne({ email: input.email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const user = new user_model_1.User(input);
        await user.save();
        const token = this.generateToken(user);
        return { token, user };
    }
    async login(input) {
        const user = await user_model_1.User.findOne({ email: input.email });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isValidPassword = await user.comparePassword(input.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        const token = this.generateToken(user);
        return { token, user };
    }
    async addToFavorites(userId, productId) {
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.favorites.includes(productId)) {
            user.favorites.push(productId);
            await user.save();
        }
        return user;
    }
    async removeFromFavorites(userId, productId) {
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.favorites = user.favorites.filter(id => id !== productId);
        await user.save();
        return user;
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
    }
}
exports.AuthService = AuthService;
