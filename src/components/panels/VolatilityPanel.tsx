'use client';

import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { TreeView } from '@/components/ui/TreeView';
import { VolatilityBarChart } from '@/components/ui/Charts';
import { FileNode, FileVolatility } from '@/types';
import { Activity, Flame, Snowflake, CheckCircle } from 'lucide-react';

interface VolatilityPanelProps {
    fileTree: FileNode;
    volatileFiles: FileVolatility[];
}

export function VolatilityPanel({ fileTree, volatileFiles }: VolatilityPanelProps) {
    const hotFiles = volatileFiles.filter(f => f.status === 'hot');
    const stableFiles = volatileFiles.filter(f => f.status === 'stable');
    const coldFiles = volatileFiles.filter(f => f.status === 'cold');
    const abandonedFiles = volatileFiles.filter(f => f.status === 'abandoned');

    // Chart data
    const chartData = volatileFiles.slice(0, 6).map(f => ({
        name: f.path.split('/').pop() || f.path,
        commits: f.commitCount,
        status: f.status,
    }));

    return (
        <Card className="h-full flex flex-col p-4">
            <CardHeader
                title="Change Volatility"
                subtitle="File change frequency"
                icon={<Activity size={16} />}
            />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                <MiniStat icon={<Flame size={12} />} value={hotFiles.length} label="Hot" color="danger" />
                <MiniStat icon={<CheckCircle size={12} />} value={stableFiles.length} label="Stable" color="success" />
                <MiniStat icon={<Snowflake size={12} />} value={coldFiles.length} label="Cold" color="muted" />
                <MiniStat value={abandonedFiles.length} label="Abandoned" color="muted" />
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="mb-4">
                    <VolatilityBarChart data={chartData} />
                </div>
            )}

            {/* Tree */}
            <div className="flex-1 min-h-0 overflow-auto border border-[--border] rounded-lg p-2">
                {fileTree.children?.length ? (
                    <TreeView data={fileTree} />
                ) : (
                    <p className="text-xs text-[--text-muted] p-2">No files found</p>
                )}
            </div>
        </Card>
    );
}

function MiniStat({
    icon,
    value,
    label,
    color
}: {
    icon?: React.ReactNode;
    value: number;
    label: string;
    color: 'success' | 'warning' | 'danger' | 'muted';
}) {
    const textColors = {
        success: 'text-[--success]',
        warning: 'text-[--warning]',
        danger: 'text-[--danger]',
        muted: 'text-[--text-muted]',
    };

    return (
        <div className="text-center p-2 rounded-lg bg-[--bg-tertiary]">
            <div className={`text-lg font-semibold ${textColors[color]}`}>{value}</div>
            <div className="text-[10px] text-[--text-muted] flex items-center justify-center gap-1">
                {icon}
                {label}
            </div>
        </div>
    );
}
