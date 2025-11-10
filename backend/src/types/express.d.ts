// Extend Express Request type to include user
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  tokenVersion: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
