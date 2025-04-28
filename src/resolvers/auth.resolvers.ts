import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

interface Context {
  user: {
    id: string;
  } | null;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const authService = new AuthService();

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: Context) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return User.findById(user.id);
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }) => {
      return authService.register(input);
    },

    login: async (_: any, { input }: { input: LoginInput }) => {
      return authService.login(input);
    },

    addToFavorites: async (_: any, { productId }: { productId: string }, { user }: Context) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return authService.addToFavorites(user.id, productId);
    },

    removeFromFavorites: async (_: any, { productId }: { productId: string }, { user }: Context) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return authService.removeFromFavorites(user.id, productId);
    },
  },

  User: {
    __resolveReference: async (reference: { id: string }) => {
      return User.findById(reference.id);
    },
  },
};
