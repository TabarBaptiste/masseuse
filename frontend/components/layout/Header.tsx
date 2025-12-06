'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { UserRole } from '@/types';
import { Menu, X, User, Settings, LogOut, Flower, Home, LogIn } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="heading-serif text-xl sm:text-2xl font-bold text-amber-800 hover:text-amber-900 transition-colors">
              Aly Dous'heure
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-stone-700 hover:text-amber-800 px-3 py-2 text-sm font-medium transition-colors">
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </Link>
            <Link href="/services" className="flex items-center space-x-2 text-stone-700 hover:text-amber-800 px-3 py-2 text-sm font-medium transition-colors">
              <Flower className="w-4 h-4" />
              <span>Mes Soins</span>
            </Link>
            {isInitialized && isAuthenticated && (
              <Link href="/profile" className="flex items-center space-x-2 text-stone-700 hover:text-amber-800 px-3 py-2 text-sm font-medium transition-colors">
                <User className="w-4 h-4" />
                <span>{user?.firstName}</span>
              </Link>
            )}

            {/* Auth Section Desktop */}
            {!isInitialized ? (
              <div className="ml-4 pl-4 border-l border-stone-200">
                <div className="w-24 h-8 bg-stone-200 animate-pulse rounded"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-stone-200">
                {/* <span className="hidden xl:inline-block text-sm text-stone-600">
                  {user?.firstName}
                </span> */}
                {user?.role === UserRole.PRO && (
                  <Link href="/pro/dashboard" className="flex items-center space-x-2 text-stone-700 hover:text-amber-800 text-sm font-medium transition-colors">
                    <Settings className="w-4 h-4" /><span>Dashboard PRO</span>
                  </Link>
                )}
                {user?.role === UserRole.ADMIN && (
                  <Link href="/admin/dashboard" className="flex items-center space-x-2 text-stone-700 hover:text-amber-800 text-sm font-medium transition-colors">
                    <Settings className="w-4 h-4" /><span>Dashboard Admin</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-stone-200">
                <Link href="/login" className="flex items-center space-x-2 text-stone-700 hover:text-amber-800 px-3 py-2 text-sm font-medium transition-colors">
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </Link>
                <Link href="/login" className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md">
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
                <Menu className="block h-6 w-6" />
              ) : (
                <X className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>Accueil</span>
              </Link>
              <Link
                href="/services"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Flower className="w-5 h-5" />
                <span>Mes Soins</span>
              </Link>

              {isInitialized && isAuthenticated && (
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>{user?.firstName}</span>
                </Link>
              )}

              {!isInitialized ? (
                <div className="px-3 py-2 border-t border-stone-200 mt-2 pt-2">
                  <div className="h-8 bg-stone-200 animate-pulse rounded"></div>
                </div>
              ) : isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-stone-600 border-t border-stone-200 mt-2 pt-2">
                    {user?.firstName} {user?.lastName}
                  </div>

                  {user?.role === UserRole.PRO && (
                    <Link
                      href="/pro/dashboard"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Dashboard PRO</span>
                    </Link>
                  )}

                  {user?.role === UserRole.ADMIN && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Dashboard Admin</span>
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
                    className="flex items-center space-x-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:text-amber-800 hover:bg-stone-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Connexion</span>
                  </Link>
                  <Link
                    href="/login"
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
