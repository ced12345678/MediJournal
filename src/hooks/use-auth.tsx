"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

const APP_PREFIX = 'medijournal-';
const USERS_KEY = `${APP_PREFIX}users`;
const SESSION_KEY = `${APP_PREFIX}session`;

type User = {
  id: string;
  username: string;
  name: string;
  passwordHash: string; // In a real app, this would be handled by a secure backend.
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => boolean;
  signup: (name: string, password: string) => { user: User };
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple (and insecure) hashing function for demonstration purposes.
// DO NOT use this in a production environment.
const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const sessionUser = sessionStorage.getItem(SESSION_KEY);
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    } catch (e) {
      console.error("Failed to parse session user from storage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsers = (): User[] => {
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const signup = (name: string, password: string) => {
    if (!name || !password) {
      throw new Error("Name and password are required.");
    }
    const users = getUsers();
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${cleanName}${randomSuffix}`;

    if (users.some(u => u.username === username)) {
      // Very unlikely, but handle it.
      return signup(name, password);
    }

    const newUser: User = {
      id: self.crypto.randomUUID(),
      username,
      name,
      passwordHash: simpleHash(password),
    };

    users.push(newUser);
    saveUsers(users);

    return { user: newUser };
  };

  const login = (username: string, password: string): boolean => {
    const users = getUsers();
    const foundUser = users.find(u => u.username === username);

    if (foundUser && foundUser.passwordHash === simpleHash(password)) {
      setUser(foundUser);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    router.push('/login');
  };

  const value = { user, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
