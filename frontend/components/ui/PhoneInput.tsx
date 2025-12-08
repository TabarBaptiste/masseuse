import React from 'react';
import clsx from 'clsx';

interface PhoneInputProps {
    label?: string;
    prefixValue?: string;
    numberValue?: string;
    onPrefixChange?: (value: string) => void;
    onNumberChange?: (value: string) => void;
    error?: string;
    className?: string;
}

const countryCodes = [
    { code: '+596', country: 'Mq' },
    { code: '+590', country: 'Gp' },
    { code: '+33', country: 'Fr' },
    { code: '+40', country: 'Ro' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
    label,
    prefixValue,
    numberValue = '',
    onPrefixChange,
    onNumberChange,
    error,
    className,
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="flex">
                <select
                    value={prefixValue}
                    onChange={(e) => onPrefixChange?.(e.target.value)}
                    className={clsx(
                        'px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50',
                        error ? 'border-red-500' : 'border-gray-300',
                        className
                    )}
                >
                    {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.code}
                        </option>
                    ))}
                </select>
                <input
                    type="tel"
                    value={numberValue}
                    onChange={(e) => onNumberChange?.(e.target.value)}
                    placeholder="696 12 34 56"
                    className={clsx(
                        'flex-1 px-4 py-2 border-l-0 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        error ? 'border-red-500' : 'border-gray-300',
                        className
                    )}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};