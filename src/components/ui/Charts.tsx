'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    AreaChart,
    Area,
    CartesianGrid,
    Legend,
} from 'recharts';

// Color palette for charts - matching teal theme
const COLORS = {
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#fb7185',
    accent: '#2dd4bf',
    muted: '#71717a',
};

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;

    return (
        <div className="chart-tooltip">
            {label && <p className="text-sm font-medium text-[--text-primary] mb-1">{label}</p>}
            {payload.map((entry: any, index: number) => (
                <p key={index} className="text-xs text-[--text-secondary]">
                    <span style={{ color: entry.color }}>{entry.name}:</span> {entry.value}
                </p>
            ))}
        </div>
    );
}

// File volatility bar chart
interface VolatilityBarChartProps {
    data: { name: string; commits: number; status: string }[];
}

export function VolatilityBarChart({ data }: VolatilityBarChartProps) {
    const getBarColor = (status: string) => {
        switch (status) {
            case 'hot': return COLORS.danger;
            case 'stable': return COLORS.success;
            case 'cold': return COLORS.muted;
            case 'abandoned': return '#52525b';
            default: return COLORS.accent;
        }
    };

    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar
                    dataKey="commits"
                    radius={[0, 4, 4, 0]}
                    fill={COLORS.accent}
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={getBarColor(entry.status)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

// Dependency health pie chart
interface DependencyPieChartProps {
    data: { name: string; value: number; health: string }[];
}

export function DependencyPieChart({ data }: DependencyPieChartProps) {
    const getColor = (health: string) => {
        switch (health) {
            case 'active': return COLORS.success;
            case 'aging': return COLORS.warning;
            case 'abandoned': return COLORS.danger;
            default: return COLORS.muted;
        }
    };

    return (
        <ResponsiveContainer width="100%" height={180}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={getColor(entry.health)} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
}

// Risk radar chart
interface RiskRadarChartProps {
    data: { metric: string; value: number; fullMark: number }[];
}

export function RiskRadarChart({ data }: RiskRadarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                />
                <Radar
                    name="Risk"
                    dataKey="value"
                    stroke={COLORS.accent}
                    fill={COLORS.accent}
                    fillOpacity={0.2}
                />
                <Tooltip content={<CustomTooltip />} />
            </RadarChart>
        </ResponsiveContainer>
    );
}

// Activity area chart (for trends over time)
interface ActivityChartProps {
    data: { date: string; commits: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
    return (
        <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="commits"
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    fill="url(#colorCommits)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// Score ring component (replaces gauge)
interface ScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    inverted?: boolean;
}

export function ScoreRing({
    score,
    size = 100,
    strokeWidth = 8,
    label,
    inverted = false,
}: ScoreRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        const effectiveScore = inverted ? 100 - score : score;
        if (effectiveScore >= 70) return COLORS.success;
        if (effectiveScore >= 40) return COLORS.warning;
        return COLORS.danger;
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--bg-tertiary)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={getColor()}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className="text-xl font-semibold"
                        style={{ color: getColor() }}
                    >
                        {Math.round(score)}
                    </span>
                </div>
            </div>
            {label && (
                <span className="text-xs text-[--text-muted]">{label}</span>
            )}
        </div>
    );
}

// Mini stat with trend
interface MiniStatProps {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export function MiniStat({ label, value, trend, trendValue }: MiniStatProps) {
    const trendColors = {
        up: 'text-[--success]',
        down: 'text-[--danger]',
        neutral: 'text-[--text-muted]',
    };

    return (
        <div className="p-4 rounded-lg bg-[--bg-tertiary]">
            <p className="text-xs text-[--text-muted] mb-1">{label}</p>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold text-[--text-primary]">{value}</span>
                {trend && trendValue && (
                    <span className={`text-xs ${trendColors[trend]} mb-1`}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                    </span>
                )}
            </div>
        </div>
    );
}
