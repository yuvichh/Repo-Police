'use client';

import { Card, CardHeader } from '@/components/ui/Card';
import { RiskBadge, StatusDot } from '@/components/ui/Badge';
import { RiskZone } from '@/types';
import { Shield, CheckCircle } from 'lucide-react';

interface RiskZonesPanelProps {
    riskZones: RiskZone[];
}

export function RiskZonesPanel({ riskZones }: RiskZonesPanelProps) {
    const highRisk = riskZones.filter(z => z.riskLevel === 'high');
    const mediumRisk = riskZones.filter(z => z.riskLevel === 'medium');

    return (
        <Card className="h-full flex flex-col p-4">
            <CardHeader
                title="Risk Zones"
                subtitle="Areas with elevated risk"
                icon={<Shield size={16} />}
            />

            {/* Summary */}
            <div className="flex gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <StatusDot status="danger" />
                    <span className="text-[--text-secondary]">{highRisk.length} High</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <StatusDot status="warning" />
                    <span className="text-[--text-secondary]">{mediumRisk.length} Medium</span>
                </div>
            </div>

            {/* Zones list */}
            <div className="flex-1 overflow-auto space-y-2">
                {riskZones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <CheckCircle size={32} className="text-[--success] mb-2" />
                        <p className="text-sm text-[--text-secondary]">No risk zones detected</p>
                        <p className="text-xs text-[--text-muted]">Codebase appears well-structured</p>
                    </div>
                ) : (
                    riskZones.map((zone) => (
                        <RiskZoneCard key={zone.id} zone={zone} />
                    ))
                )}
            </div>
        </Card>
    );
}

function RiskZoneCard({ zone }: { zone: RiskZone }) {
    const bgColors = {
        high: 'bg-[--danger-subtle] border-[--danger]/20',
        medium: 'bg-[--warning-subtle] border-[--warning]/20',
        low: 'bg-[--success-subtle] border-[--success]/20',
    };

    return (
        <div className={`rounded-lg border p-3 ${bgColors[zone.riskLevel]}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-[--text-primary]">{zone.name}</span>
                <RiskBadge level={zone.riskLevel} />
            </div>

            <div className="space-y-1">
                {zone.reasons.slice(0, 2).map((reason, idx) => (
                    <p key={idx} className="text-xs text-[--text-muted]">· {reason}</p>
                ))}
            </div>

            <p className="text-[10px] text-[--text-faint] mt-2">
                {zone.paths.length} files affected
            </p>
        </div>
    );
}
