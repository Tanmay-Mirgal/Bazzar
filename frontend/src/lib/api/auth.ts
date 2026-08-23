import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/user';
import { apiFetch } from './client';

interface BackendAuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const data = await apiFetch<BackendAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  const user: User = {
    id: String(data.user.id),
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('bazzar_user', JSON.stringify(user));
    localStorage.setItem('bazzar_token', data.token);
  }

  return { user, token: data.token, message: 'Login successful' };
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const response = await apiFetch<BackendAuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
    }),
  });

  const user: User = {
    id: String(response.user.id),
    name: response.user.name,
    email: response.user.email,
    role: response.user.role,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('bazzar_user', JSON.stringify(user));
    localStorage.setItem('bazzar_token', response.token);
  }

  return { user, token: response.token, message: 'Account created successfully' };
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('bazzar_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function refreshCurrentUser(): Promise<User | null> {
  try {
    const userData = await apiFetch<{ id: number; name: string; email: string; role: string }>('/auth/me');
    const user: User = {
      id: String(userData.id),
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('bazzar_user', JSON.stringify(user));
    }
    return user;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bazzar_user');
    localStorage.removeItem('bazzar_token');
  }
}
