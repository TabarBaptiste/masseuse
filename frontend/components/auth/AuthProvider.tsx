'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
};
