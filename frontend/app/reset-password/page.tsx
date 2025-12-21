'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setSuccess(true);
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-medium">Lien invalide</p>
                <p className="text-sm mt-1">
                  Le lien de réinitialisation est invalide ou a expiré.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="inline-block text-blue-600 hover:text-blue-500 font-medium"
              >
                Demander un nouveau lien
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-gray-600">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <Card>
          {success ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">Mot de passe modifié !</p>
                <p className="text-sm mt-1">
                  Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block text-blue-600 hover:text-blue-500 font-medium"
              >
                Se connecter maintenant
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Input
                label="Nouveau mot de passe"
                type="password"
                {...register('password', {
                  required: 'Mot de passe requis',
                  minLength: {
                    value: 8,
                    message: 'Le mot de passe doit contenir au moins 8 caractères',
                  },
                  pattern: {
                    value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
                  },
                })}
                error={errors.password?.message}
              />

              <Input
                label="Confirmer le mot de passe"
                type="password"
                {...register('confirmPassword', {
                  required: 'Confirmation requise',
                  validate: (value) =>
                    value === password || 'Les mots de passe ne correspondent pas',
                })}
                error={errors.confirmPassword?.message}
              />

              <div className="text-xs text-gray-500">
                Le mot de passe doit contenir au moins :
                <ul className="list-disc list-inside mt-1">
                  <li>8 caractères</li>
                  <li>Une lettre majuscule</li>
                  <li>Une lettre minuscule</li>
                  <li>Un chiffre</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
