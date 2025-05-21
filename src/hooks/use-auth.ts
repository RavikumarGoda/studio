// src/hooks/use-auth.ts
"use client";

import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';


// This is a mock hook. In a real app, this would interact with Firebase Auth.
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching user data
    const mockUserString = localStorage.getItem('mockUser');
    if (mockUserString) {
      try {
        const parsedUser = JSON.parse(mockUserString) as User;
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('mockUser');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((email: string, role: 'owner' | 'player') => {
    const mockUserData: User = {
      uid: role === 'owner' ? 'mock-owner-uid' : 'mock-player-uid',
      name: role === 'owner' ? 'Owner User' : 'Player User',
      email: email,
      role: role,
      createdAt: new Date(),
    };
    localStorage.setItem('mockUser', JSON.stringify(mockUserData));
    setUser(mockUserData);
    router.push(role === 'owner' ? '/owner/dashboard' : '/player/dashboard');
  }, [router]);

  const signup = useCallback((name: string, email: string, role: 'owner' | 'player') => {
    // In a real app, this would call Firebase signup
    // For mock, it's the same as login
    const mockUserData: User = {
      uid: role === 'owner' ? `mock-owner-${Date.now()}` : `mock-player-${Date.now()}`,
      name: name,
      email: email,
      role: role,
      createdAt: new Date(),
    };
    localStorage.setItem('mockUser', JSON.stringify(mockUserData));
    setUser(mockUserData);
    router.push(role === 'owner' ? '/owner/dashboard' : '/player/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('mockUser');
    setUser(null);
    router.push('/login');
  }, [router]);
  
  return { user, loading, login, signup, logout }; 
};
