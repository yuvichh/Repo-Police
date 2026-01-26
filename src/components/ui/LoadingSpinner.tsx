'use client';

import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return <Loader2 className={`${sizes[size]} animate-spin text-[--accent]`} />;
}

interface LoadingStateProps {
    message?: string;
    submessage?: string;
}

export function LoadingState({
    message = 'Analyzing repository...',
    submessage
}: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-[--accent-subtle] flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-[--text-primary] font-medium">{message}</p>
                {submessage && (
                    <p className="text-[--text-muted] text-sm mt-1">{submessage}</p>
                )}
            </div>
        </div>
    );
}

export function SkeletonBox({ className = '' }: { className?: string }) {
    return (
        <div
            className={`bg-[--bg-tertiary] rounded animate-pulse ${className}`}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
                <SkeletonBox className="w-9 h-9 rounded-lg" />
                <div className="flex-1">
                    <SkeletonBox className="h-4 w-28" />
                    <SkeletonBox className="h-3 w-20 mt-2" />
                </div>
            </div>
            <div className="space-y-2">
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-3 w-4/5" />
                <SkeletonBox className="h-3 w-3/5" />
            </div>
        </div>
    );
}
