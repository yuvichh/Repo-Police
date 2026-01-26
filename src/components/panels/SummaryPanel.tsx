'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/Charts';
import { AnalysisSummary, RepoInfo } from '@/types';
import { Target, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface SummaryPanelProps {
    summary: AnalysisSummary;
    repoInfo: RepoInfo;
}

export function SummaryPanel({ summary, repoInfo }: SummaryPanelProps) {
    const {
        maintenanceRiskScore,
        dependencyRiskScore,
        busFactor,
        verdict,
        highlights,
    } = summary;

    const overallHealth = Math.round(100 - (maintenanceRiskScore + dependencyRiskScore) / 2);

    return (
        <Card className="h-full flex flex-col p-4">
            <CardHeader
                title="Summary"
                subtitle="Adoption assessment"
                icon={<Target size={16} />}
            />

            {/* Repo info */}
            <div className="pb-3 mb-3 border-b border-[--border]">
                <p className="text-sm font-medium text-[--text-primary]">{repoInfo.fullName}</p>
                {repoInfo.description && (
                    <p className="text-xs text-[--text-muted] mt-1 line-clamp-2">{repoInfo.description}</p>
                )}
            </div>

            {/* Score rings */}
            <div className="flex justify-around mb-4">
                <ScoreRing score={overallHealth} label="Overall" size={70} />
                <ScoreRing score={100 - maintenanceRiskScore} label="Maintenance" size={70} />
                <ScoreRing score={100 - dependencyRiskScore} label="Dependencies" size={70} />
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 rounded-lg bg-[--bg-tertiary]">
                    <p className="text-[10px] text-[--text-muted]">Bus Factor</p>
                    <p className={`text-lg font-semibold ${busFactor >= 3 ? 'text-[--success]' : busFactor === 1 ? 'text-[--danger]' : 'text-[--warning]'}`}>
                        {busFactor}
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-[--bg-tertiary]">
                    <p className="text-[10px] text-[--text-muted]">Risk Level</p>
                    <p className={`text-lg font-semibold ${overallHealth >= 70 ? 'text-[--success]' : overallHealth >= 40 ? 'text-[--warning]' : 'text-[--danger]'}`}>
                        {overallHealth >= 70 ? 'Low' : overallHealth >= 40 ? 'Medium' : 'High'}
                    </p>
                </div>
            </div>

            {/* Verdict */}
            <div className="p-3 rounded-lg bg-[--bg-tertiary] mb-4">
                <p className="text-xs text-[--text-secondary] leading-relaxed">{verdict}</p>
            </div>

            {/* Highlights */}
            <div className="flex-1 overflow-auto space-y-1.5">
                {highlights.slice(0, 4).map((h, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-2 p-2 rounded-lg text-xs ${h.type === 'positive' ? 'bg-[--success-subtle] text-[--success]' :
                                h.type === 'warning' ? 'bg-[--warning-subtle] text-[--warning]' :
                                    'bg-[--danger-subtle] text-[--danger]'
                            }`}
                    >
                        {h.type === 'positive' ? <CheckCircle size={12} className="mt-0.5 flex-shrink-0" /> :
                            h.type === 'warning' ? <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" /> :
                                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />}
                        <span>{h.message}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
