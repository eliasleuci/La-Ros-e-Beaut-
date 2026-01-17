import React from 'react';

export function Card({ children, className = '', variant = 'default' }: { children: React.ReactNode; className?: string, variant?: 'default' | 'glass' }) {
    const variants = {
        default: "bg-white shadow-sm border border-stone-100",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
    };

    return (
        <div
            className={`p-6 md:p-8 rounded-2xl transition-all duration-300 ${variants[variant]} ${className}`}
        >
            {children}
        </div>
    );
}
