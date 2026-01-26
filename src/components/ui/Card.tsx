'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`card ${className}`}>
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
}

export function CardHeader({ title, subtitle, icon }: CardHeaderProps) {
    return (
        <div className="flex items-center gap-2.5 mb-4">
            {icon && (
                <div className="w-7 h-7 rounded-md bg-[--accent-subtle] flex items-center justify-center text-[--accent]">
                    {icon}
                </div>
            )}
            <div>
                <h3 className="text-sm font-medium text-[--text-primary]">{title}</h3>
                {subtitle && (
                    <p className="text-[10px] text-[--text-muted]">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
    const variantStyles = {
        default: 'bg-[--bg-tertiary]',
        success: 'bg-[--success-subtle]',
        warning: 'bg-[--warning-subtle]',
        danger: 'bg-[--danger-subtle]',
    };

    return (
        <div className={`p-2 rounded-lg ${variantStyles[variant]}`}>
            <div className="flex items-center gap-1 text-[--text-muted] mb-0.5">
                {icon}
                <span className="text-[10px]">{label}</span>
            </div>
            <div className="text-lg font-semibold text-[--text-primary]">{value}</div>
        </div>
    );
}
