import React from 'react';

interface FormFieldProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'tel' | 'number' | 'url' | 'textarea' | 'checkbox';
    value?: string | number | boolean;
    defaultValue?: string | number | boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onUserChange?: (value: any) => void;
    placeholder?: string;
    required?: boolean;
    min?: string | number;
    step?: string | number;
    rows?: number;
    className?: string;
    labelClassName?: string;
    inputClassName?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    defaultValue,
    onChange,
    onUserChange,
    placeholder,
    required = false,
    min,
    step,
    rows = 4,
    className = '',
    labelClassName = 'block text-sm font-medium text-gray-700 mb-2',
    inputClassName = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent',
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onChange) {
            onChange(e);
        }
        if (onUserChange) {
            const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
            onUserChange(value);
        }
    };

    const commonProps = {
        name,
        id: name,
        required,
        className: inputClassName,
        onChange: handleChange,
        placeholder,
    };

    if (type === 'checkbox') {
        return (
            <div className={`flex items-center ${className}`}>
                <input
                    type="checkbox"
                    {...commonProps}
                    checked={value as boolean}
                    defaultChecked={defaultValue as boolean}
                />
                <label htmlFor={name} className={`ml-2 ${labelClassName}`}>
                    {label}
                </label>
            </div>
        );
    }

    if (type === 'textarea') {
        return (
            <div className={className}>
                <label htmlFor={name} className={labelClassName}>
                    {label} {required && '*'}
                </label>
                <textarea
                    {...commonProps}
                    rows={rows}
                    value={value as string}
                    defaultValue={defaultValue as string}
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <label htmlFor={name} className={labelClassName}>
                {label} {required && '*'}
            </label>
            <input
                type={type}
                {...commonProps}
                value={value as string | number}
                defaultValue={defaultValue as string | number}
                min={min}
                step={step}
            />
        </div>
    );
};