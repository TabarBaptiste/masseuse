'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="heading-serif text-xl sm:text-2xl font-bold text-amber-800 hover:text-amber-900 transition-colors">
              Zen Massage
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            <Link href="/services" className="text-stone-700 hover:text-amber-800 px-3 py-2 text-sm font-medium transition-colors">
              Nos Soins
            </Link>
            {isAuthenticated && (
              <Link href="/profile" className="text-stone-700 hover:text-amber-800 px-3 py-2 text-sm font-medium transition-colors">
                Mon Profil
              </Link>
            )}
            
            {/* Auth Section Desktop */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-stone-200">
                <span className="hidden xl:inline-block text-sm text-stone-600">
                  {user?.firstName}
                </span>
                {user?.role === UserRole.PRO && (
                  <Link href="/pro/dashboard" className="text-stone-700 hover:text-amber-800 text-sm font-medium transition-colors">
                    Dashboard PRO
                  </Link>
                )}
                {user?.role === UserRole.ADMIN && (
                  <Link href="/admin/dashboard" className="text-stone-700 hover:text-amber-800 text-sm font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-stone-200">
                <Link href="/login" className="text-stone-700 hover:text-amber-800 px-3 py-2 text-sm font-medium transition-colors">
                  Connexion
                </Link>
                <Link href="/register" className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md">
                  Réserver
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-stone-700 hover:text-amber-800 hover:bg-stone-100 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/services"
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nos Soins
              </Link>
              
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mon Profil
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-stone-600 border-t border-stone-200 mt-2 pt-2">
                    {user?.firstName} {user?.lastName}
                  </div>
                  
                  {user?.role === UserRole.PRO && (
                    <Link
                      href="/pro/dashboard"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard PRO
                    </Link>
                  )}
                  
                  {user?.role === UserRole.ADMIN && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard Admin
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <div className="space-y-1 border-t border-stone-200 mt-2 pt-2">
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-lg text-base font-medium bg-amber-800 text-white hover:bg-amber-900 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Réserver
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
