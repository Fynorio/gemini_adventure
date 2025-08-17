import type { User } from '../types';

// In a real app, this would be a secure backend.
// For this simulation, we use localStorage.

const USERS_KEY = 'gemini_adventure_users';
const CURRENT_USER_KEY = 'gemini_adventure_currentUser';

// Helper to get users from localStorage
const getUsers = (): (User & { passwordHash: string })[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save users to localStorage
const saveUsers = (users: (User & { passwordHash: string })[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// "Hashing" is just reversing the string for this simulation.
// DO NOT do this in a real application.
const hashPassword = (password: string): string => password.split('').reverse().join('');

export const register = (email: string, password: string): User => {
  const users = getUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }
  
  if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
  }

  const newUser: User & { passwordHash: string } = {
    id: `user_${Date.now()}`,
    email,
    passwordHash: hashPassword(password),
  };

  users.push(newUser);
  saveUsers(users);
  
  const { passwordHash, ...userToReturn } = newUser;
  
  // Automatically log in the new user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));
  
  return userToReturn;
};

export const login = (email: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error('Invalid email or password.');
  }

  const { passwordHash, ...userToReturn } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));
  
  return userToReturn;
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};
