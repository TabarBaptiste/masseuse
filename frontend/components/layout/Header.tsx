'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Zen Massage
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/services" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Services
              </Link>
              {isAuthenticated && (
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Mon Profil
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                {user?.role === UserRole.PRO && (
                  <Link href="/pro/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    Dashboard PRO
                  </Link>
                )}
                {user?.role === UserRole.ADMIN && (
                  <Link href="/admin/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    Dashboard Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Connexion
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
