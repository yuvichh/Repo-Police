'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RepoAnalysis } from '@/types';
import { VolatilityPanel } from '@/components/panels/VolatilityPanel';
import { RiskZonesPanel } from '@/components/panels/RiskZonesPanel';
import { DependencyTreePanel } from '@/components/panels/DependencyTreePanel';
import { SummaryPanel } from '@/components/panels/SummaryPanel';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Star, GitFork, ExternalLink, Shield } from 'lucide-react';

export default function AnalyzePage() {
    const router = useRouter();
    const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem('analysisResult');

        if (!stored) {
            router.push('/');
            return;
        }

        try {
            const data = JSON.parse(stored);
            setAnalysis(data);
        } catch {
            router.push('/');
            return;
        }

        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[--bg-base] flex items-center justify-center">
                <LoadingState message="Loading analysis..." />
            </div>
        );
    }

    if (!analysis) {
        return null;
    }

    const { repoInfo, fileTree, volatileFiles, riskZones, dependencyAnalysis, summary } = analysis;

    return (
        <div className="min-h-screen bg-[--bg-base]">
            {/* Header - solid background, not transparent */}
            <header className="border-b border-[--border] bg-[--bg-primary] sticky top-0 z-50">
                <div className="max-w-[1500px] mx-auto px-5 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-1.5 text-[--text-secondary] hover:text-[--text-primary] transition-colors text-sm"
                        >
                            <ArrowLeft size={14} />
                            <span>Back</span>
                        </button>

                        <div className="h-4 w-px bg-[--border]" />

                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-[--accent] flex items-center justify-center">
                                <Shield size={12} className="text-[--bg-base]" />
                            </div>
                            <span className="text-sm font-medium text-[--text-primary]">{repoInfo.fullName}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-xs text-[--text-secondary]">
                            <div className="flex items-center gap-1">
                                <Star size={12} />
                                <span>{formatNumber(repoInfo.stars)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <GitFork size={12} />
                                <span>{formatNumber(repoInfo.forks)}</span>
                            </div>
                            {repoInfo.language && (
                                <span className="px-1.5 py-0.5 rounded bg-[--bg-tertiary] text-[10px]">
                                    {repoInfo.language}
                                </span>
                            )}
                        </div>
                        <a
                            href={`https://github.com/${repoInfo.fullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                        >
                            GitHub
                            <ExternalLink size={11} />
                        </a>
                    </div>
                </div>
            </header>

            {/* Dashboard Grid */}
            <main className="max-w-[1500px] mx-auto p-5">
                <div className="dashboard-grid">
                    <div className="min-h-[480px]">
                        <VolatilityPanel fileTree={fileTree} volatileFiles={volatileFiles} />
                    </div>
                    <div className="min-h-[480px]">
                        <RiskZonesPanel riskZones={riskZones} />
                    </div>
                    <div className="min-h-[480px]">
                        <DependencyTreePanel dependencyAnalysis={dependencyAnalysis} />
                    </div>
                    <div className="min-h-[480px]">
                        <SummaryPanel summary={summary} repoInfo={repoInfo} />
                    </div>
                </div>

                {/* Timestamp */}
                <p className="mt-5 text-center text-xs text-[--text-faint]">
                    Analyzed {new Date(analysis.analyzedAt).toLocaleString()}
                </p>
            </main>
        </div>
    );
}

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}
