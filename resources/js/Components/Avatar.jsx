import React from 'react';

export default function Avatar({ user, size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-20 h-20 text-xl'
    };

    const baseClasses = `rounded-full object-cover border flex-shrink-0 ${sizeClasses[size]} ${className}`;

    if (user.avatar) {
        return (
            <img
                src={`/storage/${user.avatar}`}
                alt={`${user.name}'s avatar`}
                className={baseClasses}
            />
        );
    }

    return (
        <div className={`${baseClasses} bg-gray-300 flex items-center justify-center`}>
            <span className="text-gray-600 font-medium">
                {user.name.charAt(0).toUpperCase()}
            </span>
        </div>
    );
}
