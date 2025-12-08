import React, { useState, useEffect } from 'react';
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

const formatPhoneNumber = (prefix: string, rawNumber: string): string => {
    const digits = rawNumber.replace(/\D/g, ''); // Remove non-digits

    switch (prefix) {
        case '+596':
        case '+590':
            // Format: XXX XX XX XX
            if (digits.length <= 3) return digits;
            if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
            if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
            return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
        case '+33':
            // Format: X XX XX XX XX
            if (digits.length <= 1) return digits;
            if (digits.length <= 3) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
            if (digits.length <= 5) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3)}`;
            if (digits.length <= 7) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
            if (digits.length <= 9) return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
            return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
        case '+40':
            // Format: XXX XXX XXX
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
            return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
        default:
            return digits;
    }
};

const validatePhoneNumber = (prefix: string, rawNumber: string): string | null => {
    const digits = rawNumber.replace(/\D/g, '');
    if (digits.length > 9) {
        return 'Le numéro ne peut pas dépasser 9 chiffres';
    }
    return null;
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
    label,
    prefixValue,
    numberValue = '',
    onPrefixChange,
    onNumberChange,
    error,
    className,
}) => {
    const [displayValue, setDisplayValue] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        const formatted = formatPhoneNumber(prefixValue || '+33', numberValue);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplayValue(formatted);
        const valError = validatePhoneNumber(prefixValue || '+33', numberValue);
        setValidationError(valError);
    }, [prefixValue, numberValue]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        // const rawDigits = input.replace(/\D/g, ''); // Keep only digits
        onNumberChange?.(input);
    };

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
                        (error || validationError) ? 'border-red-500' : 'border-gray-300',
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
                    value={displayValue}
                    onChange={handleNumberChange}
                    placeholder="696 12 34 56"
                    className={clsx(
                        'flex-1 px-4 py-2 border-l-0 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        (error || validationError) ? 'border-red-500' : 'border-gray-300',
                        className
                    )}
                />
            </div>
            {(error || validationError) && (
                <p className="mt-1 text-sm text-red-600">{error || validationError}</p>
            )}
        </div>
    );
};