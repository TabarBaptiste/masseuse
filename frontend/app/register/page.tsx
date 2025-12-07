'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Check, X } from 'lucide-react';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>();

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Password validation functions
  const hasMinLength = (pwd: string) => pwd.length >= 8;
  const hasSpecialChar = (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
  const hasNumber = (pwd: string) => /\d/.test(pwd);
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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const { confirmPassword: _confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      
      // Redirect to stored URL or default to profile
      const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/profile';
      localStorage.removeItem('redirectAfterLogin'); // Clean up
      router.push(redirectUrl);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Une erreur est survenue');
      // Clear password fields on error
      setValue('password', '');
      setValue('confirmPassword', '');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Créer un compte</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              connectez-vous
            </Link>
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                {...register('firstName', {
                  required: 'Prénom requis',
                  minLength: { value: 2, message: 'Minimum 2 caractères' },
                })}
                error={errors.firstName?.message}
              />

              <Input
                label="Nom"
                {...register('lastName', {
                  required: 'Nom requis',
                  minLength: { value: 2, message: 'Minimum 2 caractères' },
                })}
                error={errors.lastName?.message}
              />
            </div>

            <Input
              label="Email"
              type="email"
              {...register('email', {
                required: 'Email requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email invalide',
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Téléphone (optionnel)"
              type="tel"
              {...register('phone')}
            />

            <Input
              label="Mot de passe"
              type="password"
              {...register('password', {
                required: 'Mot de passe requis',
                minLength: { value: 8, message: 'Minimum 8 caractères' },
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Création...' : 'Créer mon compte'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
