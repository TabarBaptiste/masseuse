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
import { Check, X } from 'lucide-react';

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
  const confirmPassword = watch('confirmPassword');

  // Password validation functions
  const hasMinLength = (pwd: string) => pwd && pwd.length >= 8;
  const hasSpecialChar = (pwd: string) => pwd && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
  const hasNumber = (pwd: string) => pwd && /\d/.test(pwd);
  const passwordsMatch = (pwd: string, confirmPwd: string) => pwd === confirmPwd && pwd.length > 0;

  // Password strength component
  const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const criteria = [
      { label: 'Au moins 8 caractères', valid: hasMinLength(password) },
      { label: 'Au moins 1 caractère spécial (!@#$%^&*)', valid: hasSpecialChar(password) },
      { label: 'Au moins 1 chiffre', valid: hasNumber(password) },
    ];

    return (
      <div className="mt-2 space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center text-sm">
            {criterion.valid ? (
              <Check className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <X className="w-4 h-4 text-gray-400 mr-2" />
            )}
            <span className={criterion.valid ? 'text-green-700' : 'text-gray-500'}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Password confirmation component
  const PasswordConfirmationIndicator = ({
    password,
    confirmPassword
  }: {
    password: string;
    confirmPassword: string
  }) => {
    const isValid = passwordsMatch(password, confirmPassword);

    return (
      <div className="mt-2">
        <div className="flex items-center text-sm">
          {isValid ? (
            <Check className="w-4 h-4 text-green-500 mr-2" />
          ) : (
            <X className="w-4 h-4 text-gray-400 mr-2" />
          )}
          <span className={isValid ? 'text-green-700' : 'text-gray-500'}>
            {isValid ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
          </span>
        </div>
      </div>
    );
  };

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
                  validate: {
                    hasSpecialChar: (value) =>
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) ||
                      'Au moins 1 caractère spécial requis (!@#$%^&*...)',
                    hasNumber: (value) =>
                      /\d/.test(value) ||
                      'Au moins 1 chiffre requis',
                  },
                })}
                error={errors.password?.message}
              />

              {password && <PasswordStrengthIndicator password={password} />}

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

              {confirmPassword && password && hasMinLength(password) && hasSpecialChar(password) && hasNumber(password) && (
                <PasswordConfirmationIndicator password={password} confirmPassword={confirmPassword} />
              )}

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
