'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RepoAnalysis } from '@/types';
import { VolatilityPanel } from '@/components/panels/VolatilityPanel';
import { RiskZonesPanel } from '@/components/panels/RiskZonesPanel';
import { DependencyTreePanel } from '@/components/panels/DependencyTreePanel';
import { SummaryPanel } from '@/components/panels/SummaryPanel';
import { RepoInsightsPanel } from '@/components/panels/RepoInsightsPanel';
import { ActivityPanel } from '@/components/panels/ActivityPanel';
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

    // Calculate metrics
    const totalCommits = volatileFiles.reduce((sum, f) => sum + f.commitCount, 0);
    const uniqueContributors = new Set(volatileFiles.map(f => f.contributors)).size;
    const commitFrequency = totalCommits > 100 ? 'High' : totalCommits > 30 ? 'Moderate' : 'Low';

    return (
        <div className="min-h-screen bg-[--bg-base]">
            {/* Fixed Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: '#19191d',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{
                    maxWidth: '1600px',
                    margin: '0 auto',
                    padding: '0 20px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Left side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#a1a1aa',
                                fontSize: '13px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <ArrowLeft size={14} />
                            <span>Back</span>
                        </button>

                        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                backgroundColor: '#2dd4bf',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Shield size={12} color="#0a0a0c" />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#f4f4f5' }}>
                                {repoInfo.fullName}
                            </span>
                            {repoInfo.archived && (
                                <span style={{
                                    fontSize: '9px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                    color: '#fbbf24'
                                }}>
                                    ARCHIVED
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#a1a1aa' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={12} />
                                <span>{formatNumber(repoInfo.stars)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <GitFork size={12} />
                                <span>{formatNumber(repoInfo.forks)}</span>
                            </div>
                            {repoInfo.language && (
                                <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: '#242429',
                                    fontSize: '10px'
                                }}>
                                    {repoInfo.language}
                                </span>
                            )}
                        </div>
                        <a
                            href={`https://github.com/${repoInfo.fullName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#2dd4bf',
                                color: '#0a0a0c',
                                fontSize: '12px',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}
                        >
                            GitHub
                            <ExternalLink size={11} />
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
                {/* Top Row: Insights + Summary + Activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <RepoInsightsPanel
                        repoInfo={repoInfo}
                        contributorCount={uniqueContributors}
                        commitFrequency={commitFrequency}
                    />
                    <SummaryPanel summary={summary} repoInfo={repoInfo} />
                    <ActivityPanel volatileFiles={volatileFiles} />
                </div>

                {/* Bottom Row: Analysis Panels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <VolatilityPanel fileTree={fileTree} volatileFiles={volatileFiles} />
                    <RiskZonesPanel riskZones={riskZones} />
                    <DependencyTreePanel dependencyAnalysis={dependencyAnalysis} />
                </div>

                {/* Timestamp */}
                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#52525b' }}>
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
