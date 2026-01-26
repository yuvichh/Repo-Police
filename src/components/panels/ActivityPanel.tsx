'use client';

import { FileVolatility } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
} from 'recharts';

interface ActivityPanelProps {
    volatileFiles: FileVolatility[];
}

export function ActivityPanel({ volatileFiles }: ActivityPanelProps) {
    // Group files by status for pie chart
    const statusCounts = {
        hot: volatileFiles.filter(f => f.status === 'hot').length,
        stable: volatileFiles.filter(f => f.status === 'stable').length,
        cold: volatileFiles.filter(f => f.status === 'cold').length,
        abandoned: volatileFiles.filter(f => f.status === 'abandoned').length,
    };

    const pieData = [
        { name: 'Hot', value: statusCounts.hot, color: '#fb7185' },
        { name: 'Stable', value: statusCounts.stable, color: '#34d399' },
        { name: 'Cold', value: statusCounts.cold, color: '#71717a' },
        { name: 'Abandoned', value: statusCounts.abandoned, color: '#52525b' },
    ].filter(d => d.value > 0);

    // Top files bar chart
    const topFiles = volatileFiles
        .slice(0, 8)
        .map(f => ({
            name: f.path.split('/').pop() || f.path,
            commits: f.commitCount,
            color: f.status === 'hot' ? '#fb7185' : f.status === 'stable' ? '#34d399' : '#71717a',
        }));

    // Contributors distribution
    const contributorData = volatileFiles
        .filter(f => f.contributors > 0)
        .slice(0, 6)
        .map(f => ({
            name: f.path.split('/').pop()?.slice(0, 12) || 'file',
            contributors: f.contributors,
        }));

    return (
        <Card className="p-4 h-full">
            <CardHeader
                title="Activity Overview"
                subtitle="Interactive file analysis"
                icon={<TrendingUp size={16} />}
            />

            {/* File Status Distribution Pie */}
            <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '10px', color: '#71717a', marginBottom: '8px' }}>File Status Distribution</p>
                <div style={{ height: '120px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={50}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#242429',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {pieData.map(d => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color }} />
                            <span style={{ color: '#a1a1aa' }}>{d.name}: {d.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Files Bar Chart */}
            {topFiles.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '10px', color: '#71717a', marginBottom: '8px' }}>Most Active Files</p>
                    <div style={{ height: '140px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topFiles} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={80}
                                    tick={{ fontSize: 9, fill: '#71717a' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#242429',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                    }}
                                    formatter={(value: number) => [`${value} commits`, 'Activity']}
                                />
                                <Bar dataKey="commits" radius={[0, 4, 4, 0]}>
                                    {topFiles.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Contributors per file */}
            {contributorData.length > 0 && (
                <div>
                    <p style={{ fontSize: '10px', color: '#71717a', marginBottom: '8px' }}>Contributors per File</p>
                    <div style={{ height: '100px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={contributorData}>
                                <defs>
                                    <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 8, fill: '#52525b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#242429',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="contributors"
                                    stroke="#2dd4bf"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorContrib)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Card>
    );
}
