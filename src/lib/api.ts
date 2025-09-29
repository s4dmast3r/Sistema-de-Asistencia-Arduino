// API layer for RFID Attendance System
// Base URL points to your backend server

const API_BASE_URL = 'http://localhost:3000/api';

export interface User {
  id: number;
  name: string;
  card_uid: string;
  active: number;
}

export interface Attendance {
  id: number;
  user_id: number;
  user?: User;
  direction: 'IN' | 'OUT';
  ts: string;
}

export interface AttendanceFilters {
  date?: string;
  from?: string;
  to?: string;
}

export interface CreateUserRequest {
  name: string;
  card_uid: string;
}

// Health check
export const checkHealth = async (): Promise<{ ok: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Backend not available');
  }
  return response.json();
};

// Users API
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create user' }));
    throw new Error(error.error || 'Failed to create user');
  }
  
  return response.json();
};

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  
  return response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
};

// Attendance API
export const getAttendance = async (filters: AttendanceFilters = {}): Promise<Attendance[]> => {
  const params = new URLSearchParams();
  if (filters.date) params.append('date', filters.date);
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  
  const response = await fetch(`${API_BASE_URL}/attendance?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch attendance');
  }
  return response.json();
};

export const getPresentUsers = async (): Promise<(User & { last_in: string })[]> => {
  const response = await fetch(`${API_BASE_URL}/present`);
  if (!response.ok) {
    throw new Error('Failed to fetch present users');
  }
  return response.json();
};

// SSE Event Stream URL
export const SSE_URL = `${API_BASE_URL}/stream`;