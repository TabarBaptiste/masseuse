import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    return (
        <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
            {/* Home link */}
            <Link
                href="/"
                className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
            >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Accueil</span>
            </Link>

            {/* Separator */}
            <ChevronRight className="w-4 h-4 text-gray-400" />

            {/* Breadcrumb items */}
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-gray-900 transition-colors truncate max-w-32 sm:max-w-none"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium truncate max-w-32 sm:max-w-none">
                            {item.label}
                        </span>
                    )}

                    {/* Separator (except for last item) */}
                    {index < items.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}