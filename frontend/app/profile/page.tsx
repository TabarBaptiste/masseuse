'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Mon Profil
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Rôle</p>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Mes réservations</h2>
            <p className="text-gray-600">
              Vous n'avez pas encore de réservation.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
