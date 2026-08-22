import { LoginCredentials, RegisterData, AuthResponse } from '@/types/user';
import { simulateNetworkDelay } from './client';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  await simulateNetworkDelay(600);

  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required');
  }

  // Mock successful login response
  return {
    user: {
      id: 'usr-1',
      name: credentials.email.split('@')[0] || 'User',
      email: credentials.email,
    },
    token: 'mock-jwt-token-xyz',
    message: 'Login successful',
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

  // Mock successful registration response
  return {
    user: {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
    },
    token: 'mock-jwt-token-new-user',
    message: 'Account created successfully',
  };
}
