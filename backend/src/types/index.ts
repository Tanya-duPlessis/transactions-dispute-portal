export type Role = 'CUSTOMER' | 'ADMIN';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Express.Request {
  user: JwtPayload;
}
