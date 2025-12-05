'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (countdown === 0) {
            router.push('/');
        }
    }, [countdown, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                {/* Illustration */}
                <div className="mb-8">
                    <div className="mx-auto w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-6xl">😵</span>
                    </div>
                    <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Page introuvable
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                    </p>
                </div>

                {/* Countdown */}
                <div className="mb-8">
                    <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-amber-800">
                            Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center w-full px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium transition-colors"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Retour à l'accueil
                    </Link>

                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Page précédente
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        Si le problème persiste, contactez-nous
                    </p>
                </div>
            </div>
        </div>
    );
}