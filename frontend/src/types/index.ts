export type Role = 'CUSTOMER' | 'ADMIN';

export type Category = 'FOOD' | 'TRANSPORT' | 'SHOPPING' | 'ENTERTAINMENT' | 'UTILITIES' | 'OTHER';

export type DisputeReason =
  | 'UNAUTHORISED'
  | 'DUPLICATE'
  | 'INCORRECT_AMOUNT'
  | 'SERVICE_NOT_RECEIVED'
  | 'OTHER';

export type DisputeStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Transaction {
  id: string;
  userId: string;
  reference: string;
  amount: string;
  merchant: string;
  category: Category;
  date: string;
  description: string;
  createdAt: string;
  dispute?: Dispute | null;
}

export interface Dispute {
  id: string;
  transactionId: string;
  userId: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  createdAt: string;
  updatedAt: string;
  transaction?: Transaction;
  events?: DisputeEvent[];
  user?: User;
}

export interface DisputeEvent {
  id: string;
  disputeId: string;
  fromStatus: DisputeStatus;
  toStatus: DisputeStatus;
  note: string;
  actorId: string;
  createdAt: string;
  actor?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}
