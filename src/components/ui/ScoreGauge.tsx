'use client';

interface ScoreGaugeProps {
    score: number; // 0-100
    label: string;
    size?: 'sm' | 'md' | 'lg';
    inverted?: boolean; // If true, lower is better (for risk scores)
}

export function ScoreGauge({ score, label, size = 'md', inverted = false }: ScoreGaugeProps) {
    const sizeConfig = {
        sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg' },
        md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl' },
        lg: { width: 160, strokeWidth: 10, fontSize: 'text-4xl' },
    };

    const { width, strokeWidth, fontSize } = sizeConfig[size];
    const radius = (width - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    // Color based on score
    const getColor = () => {
        const effectiveScore = inverted ? 100 - score : score;
        if (effectiveScore >= 70) return '#22c55e'; // Green
        if (effectiveScore >= 40) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const color = getColor();

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="score-gauge" style={{ width, height: width }}>
                <svg viewBox={`0 0 ${width} ${width}`} className="score-gauge-circle">
                    {/* Background circle */}
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        className="score-gauge-bg"
                        strokeWidth={strokeWidth}
                    />
                    {/* Filled circle */}
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        className="score-gauge-fill"
                        style={{
                            stroke: color,
                            strokeDasharray: circumference,
                            strokeDashoffset: offset,
                        }}
                        strokeWidth={strokeWidth}
                    />
                </svg>
                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${fontSize} font-bold`} style={{ color }}>
                        {Math.round(score)}
                    </span>
                </div>
            </div>
            <span className="text-sm text-text-secondary">{label}</span>
        </div>
    );
}

interface ProgressBarProps {
    value: number; // 0-100
    label?: string;
    showValue?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md';
}

export function ProgressBar({
    value,
    label,
    showValue = true,
    variant = 'default',
    size = 'md'
}: ProgressBarProps) {
    const colors = {
        default: 'from-accent-primary to-accent-secondary',
        success: 'from-green-500 to-emerald-400',
        warning: 'from-amber-500 to-yellow-400',
        danger: 'from-red-500 to-rose-400',
    };

    const heights = {
        sm: 'h-1.5',
        md: 'h-2.5',
    };

    return (
        <div className="w-full">
            {(label || showValue) && (
                <div className="flex justify-between text-sm mb-1.5">
                    {label && <span className="text-text-secondary">{label}</span>}
                    {showValue && <span className="text-text-muted">{Math.round(value)}%</span>}
                </div>
            )}
            <div className={`${heights[size]} bg-white/5 rounded-full overflow-hidden`}>
                <div
                    className={`h-full bg-gradient-to-r ${colors[variant]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
        </div>
    );
}

interface StatsCardProps {
    value: string | number;
    label: string;
    icon?: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
}

export function StatsCard({ value, label, icon, trend }: StatsCardProps) {
    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-2xl font-bold text-text-primary">{value}</p>
                    <p className="text-sm text-text-muted mt-1">{label}</p>
                </div>
                {icon && (
                    <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                        {icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className={`mt-3 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </div>
            )}
        </div>
    );
}
