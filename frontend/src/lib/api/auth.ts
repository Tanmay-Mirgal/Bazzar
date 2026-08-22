import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/user';
import { simulateNetworkDelay } from './client';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  await simulateNetworkDelay(600);

  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required');
  }

  const isAdmin = credentials.email.toLowerCase() === 'admin@bazzar.com' || credentials.email.toLowerCase().includes('admin');
  const role = isAdmin ? 'ROLE_ADMIN' : 'ROLE_USER';

  const user: User = {
    id: isAdmin ? 'admin-1' : `usr-${Date.now()}`,
    name: isAdmin ? 'Store Administrator' : (credentials.email.split('@')[0] || 'Customer User'),
    email: credentials.email,
    role: role,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('bazzar_user', JSON.stringify(user));
    localStorage.setItem('bazzar_token', 'mock-jwt-token-' + role.toLowerCase());
  }

  return {
    user,
    token: 'mock-jwt-token-' + role.toLowerCase(),
    message: isAdmin ? 'Logged in as Admin' : 'Login successful',
  };
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  await simulateNetworkDelay(700);

  if (!data.name || !data.email || !data.password) {
    throw new Error('All required fields must be filled');
  }

  if (data.confirmPassword && data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const user: User = {
    id: `usr-${Date.now()}`,
    name: data.name,
    email: data.email,
    role: 'ROLE_USER',
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('bazzar_user', JSON.stringify(user));
    localStorage.setItem('bazzar_token', 'mock-jwt-token-user');
  }

  return {
    user,
    token: 'mock-jwt-token-user',
    message: 'Account created successfully in database',
  };
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('bazzar_user');
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bazzar_user');
    localStorage.removeItem('bazzar_token');
  }
}
