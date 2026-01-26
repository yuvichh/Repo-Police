'use client';

import { ReactNode } from 'react';
import { Circle, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'default' | 'info';

interface BadgeProps {
    variant: BadgeVariant;
    children: ReactNode;
    icon?: ReactNode;
    className?: string;
}

export function Badge({ variant, children, icon, className = '' }: BadgeProps) {
    const variantStyles: Record<BadgeVariant, string> = {
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        default: 'badge-default',
        info: 'bg-[--accent-subtle] text-[--accent]',
    };

    return (
        <span className={`badge ${variantStyles[variant]} ${className}`}>
            {icon}
            {children}
        </span>
    );
}

// Status indicators using icons
type FileStatus = 'hot' | 'stable' | 'cold' | 'abandoned';

export function StatusBadge({ status }: { status: FileStatus }) {
    const config = {
        hot: { label: 'Hot', variant: 'danger' as const, Icon: AlertTriangle },
        stable: { label: 'Stable', variant: 'success' as const, Icon: CheckCircle },
        cold: { label: 'Cold', variant: 'default' as const, Icon: Clock },
        abandoned: { label: 'Abandoned', variant: 'default' as const, Icon: XCircle },
    };

    const { label, variant, Icon } = config[status];

    return (
        <Badge variant={variant} icon={<Icon size={12} />}>
            {label}
        </Badge>
    );
}

type HealthStatus = 'active' | 'aging' | 'abandoned' | 'unknown';

export function HealthBadge({ health }: { health: HealthStatus }) {
    const config = {
        active: { label: 'Active', variant: 'success' as const, Icon: CheckCircle },
        aging: { label: 'Aging', variant: 'warning' as const, Icon: Clock },
        abandoned: { label: 'Abandoned', variant: 'danger' as const, Icon: XCircle },
        unknown: { label: 'Unknown', variant: 'default' as const, Icon: Circle },
    };

    const { label, variant, Icon } = config[health];

    return (
        <Badge variant={variant} icon={<Icon size={12} />}>
            {label}
        </Badge>
    );
}

type RiskLevel = 'high' | 'medium' | 'low';

export function RiskBadge({ level }: { level: RiskLevel }) {
    const config = {
        high: { label: 'High Risk', variant: 'danger' as const },
        medium: { label: 'Medium Risk', variant: 'warning' as const },
        low: { label: 'Low Risk', variant: 'success' as const },
    };

    const { label, variant } = config[level];

    return <Badge variant={variant}>{label}</Badge>;
}

// Status dot
export function StatusDot({ status }: { status: 'success' | 'warning' | 'danger' | 'muted' }) {
    return <div className={`status-dot status-dot-${status}`} />;
}
