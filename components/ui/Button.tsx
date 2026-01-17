import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'goldOutline';
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-stone-800 text-white hover:bg-black shadow-lg hover:shadow-stone-500/20 tracking-widest uppercase text-[10px] border border-stone-700",
        secondary: "bg-stone-100 text-stone-600 hover:bg-stone-200 text-sm",
        outline: "bg-transparent border border-stone-300 text-stone-300 hover:bg-white/10 hover:border-white text-sm uppercase tracking-widest",
        gold: "bg-[#C5A02E] text-white hover:bg-[#A68626] shadow-md text-[10px] uppercase tracking-widest font-bold",
        goldOutline: "bg-transparent border border-[#C5A02E] text-[#C5A02E] hover:bg-[#C5A02E]/10 text-[10px] uppercase tracking-widest font-bold"
    };

    const width = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${width} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
