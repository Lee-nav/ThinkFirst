export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  section?: string; // Default section for students if applicable
  schoolOrOrg?: string;
  createdAt: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
