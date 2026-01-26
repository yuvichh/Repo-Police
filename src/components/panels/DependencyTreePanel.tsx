'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { StatusDot } from '@/components/ui/Badge';
import { DependencyPieChart } from '@/components/ui/Charts';
import { DependencyAnalysis } from '@/types';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';

interface DependencyTreePanelProps {
    dependencyAnalysis: DependencyAnalysis;
}

export function DependencyTreePanel({ dependencyAnalysis }: DependencyTreePanelProps) {
    const { ecosystem, dependencies, overallHealthScore, totalDependencies } = dependencyAnalysis;

    const activeDeps = dependencies.filter(d => d.health === 'active');
    const agingDeps = dependencies.filter(d => d.health === 'aging');
    const abandonedDeps = dependencies.filter(d => d.health === 'abandoned');

    const pieData = [
        { name: 'Active', value: activeDeps.length, health: 'active' },
        { name: 'Aging', value: agingDeps.length, health: 'aging' },
        { name: 'Abandoned', value: abandonedDeps.length, health: 'abandoned' },
    ].filter(d => d.value > 0);

    const getProgressColor = () => {
        if (overallHealthScore >= 70) return 'success';
        if (overallHealthScore >= 40) return 'warning';
        return 'danger';
    };

    return (
        <Card className="h-full flex flex-col p-4">
            <CardHeader
                title="Dependencies"
                subtitle={`${ecosystem} · ${totalDependencies} packages`}
                icon={<Package size={16} />}
            />

            {/* Health score */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-[--text-muted]">Health Score</span>
                    <span className="text-[--text-primary] font-medium">{overallHealthScore}</span>
                </div>
                <div className="progress-bar">
                    <div
                        className={`progress-fill progress-fill-${getProgressColor()}`}
                        style={{ width: `${overallHealthScore}%` }}
                    />
                </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <CheckCircle size={11} className="text-[--success]" />
                    <span>{activeDeps.length} active</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-[--warning]" />
                    <span>{agingDeps.length} aging</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <XCircle size={11} className="text-[--danger]" />
                    <span>{abandonedDeps.length} abandoned</span>
                </div>
            </div>

            {/* Pie chart if data exists */}
            {pieData.length > 0 && (
                <div className="flex justify-center mb-4">
                    <DependencyPieChart data={pieData} />
                </div>
            )}

            {/* Dependency list */}
            <div className="flex-1 overflow-auto border border-[--border] rounded-lg">
                {totalDependencies === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                        <Package size={28} className="text-[--text-muted] mb-2" />
                        <p className="text-sm text-[--text-secondary]">No dependencies found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[--border]">
                        {dependencies.slice(0, 12).map((dep, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2">
                                <StatusDot status={dep.health === 'active' ? 'success' : dep.health === 'aging' ? 'warning' : 'danger'} />
                                <span className="font-mono text-xs text-[--text-primary] truncate flex-1">{dep.name}</span>
                                <span className="text-[10px] text-[--text-muted]">{dep.version}</span>
                            </div>
                        ))}
                        {dependencies.length > 12 && (
                            <p className="text-xs text-[--text-muted] px-3 py-2">
                                +{dependencies.length - 12} more
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
