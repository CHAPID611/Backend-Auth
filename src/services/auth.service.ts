import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';

export class AuthService {
  private readonly jwtSecret: Secret;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User(input);
    await user.save();

    const token = this.generateToken(user);
    return { token, user };
  }

  async login(input: { email: string; password: string }) {
    const user = await User.findOne({ email: input.email });
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

  async addToFavorites(userId: string, productId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    return user;
  }

  async removeFromFavorites(userId: string, productId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.favorites = user.favorites.filter(id => id !== productId);
    await user.save();

    return user;
  }

  private generateToken(user: IUser): string {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const options = {
      expiresIn: this.jwtExpiresIn as string
    } as SignOptions;

    return jwt.sign(payload, this.jwtSecret, options);
  }
}
