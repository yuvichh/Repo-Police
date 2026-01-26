import { Shield, ArrowLeft, Activity, Package, Target, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-[--bg-base]">
            {/* Header */}
            <header className="border-b border-[--border] bg-[--bg-primary]">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[--accent] flex items-center justify-center">
                            <Shield size={16} className="text-[--bg-base]" />
                        </div>
                        <span className="text-base font-semibold text-[--text-primary]">RepoPolice</span>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-sm text-[--text-secondary] hover:text-[--text-primary]"
                    >
                        <ArrowLeft size={14} />
                        Back to Analyzer
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-2xl font-bold text-[--text-primary] mb-2">
                    How to Read Your Analysis
                </h1>
                <p className="text-[--text-secondary] mb-10">
                    Understanding the metrics and recommendations from RepoPolice
                </p>

                {/* Panels Overview */}
                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-[--text-primary] mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-[--accent]" />
                        Change Volatility Panel
                    </h2>
                    <div className="card p-5 space-y-4">
                        <p className="text-sm text-[--text-secondary]">
                            Analyzes how frequently files are modified based on commit history.
                        </p>

                        <div className="space-y-3">
                            <MetricExplainer
                                name="Hot Files"
                                color="danger"
                                description="Files changed frequently in recent commits. May indicate active development or instability."
                            />
                            <MetricExplainer
                                name="Stable Files"
                                color="success"
                                description="Files with moderate, healthy change rate. Good sign of maturity."
                            />
                            <MetricExplainer
                                name="Cold Files"
                                color="muted"
                                description="Rarely changed files. Could be stable utilities or neglected code."
                            />
                            <MetricExplainer
                                name="Abandoned Files"
                                color="muted"
                                description="No changes in over a year. May need review for relevance."
                            />
                        </div>

                        <div className="p-3 rounded-lg bg-[--bg-tertiary]">
                            <p className="text-xs text-[--text-muted]">
                                <strong>How to interpret:</strong> A healthy repo has mostly stable files with some hot files in active feature areas. Too many hot files everywhere suggests instability.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-[--text-primary] mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-[--accent]" />
                        Risk Zones Panel
                    </h2>
                    <div className="card p-5 space-y-4">
                        <p className="text-sm text-[--text-secondary]">
                            Identifies directories with multiple risk factors that may cause maintenance issues.
                        </p>

                        <div className="space-y-3">
                            <MetricExplainer
                                name="High Risk"
                                color="danger"
                                description="Multiple critical factors: high churn, many contributors, abandoned files. Requires careful review."
                            />
                            <MetricExplainer
                                name="Medium Risk"
                                color="warning"
                                description="Some concerning patterns detected. Monitor these areas during development."
                            />
                            <MetricExplainer
                                name="Low Risk"
                                color="success"
                                description="Minor concerns only. Generally safe but worth noting."
                            />
                        </div>

                        <div className="p-3 rounded-lg bg-[--bg-tertiary]">
                            <p className="text-xs text-[--text-muted]">
                                <strong>What to do:</strong> Focus testing and code review on high-risk zones. Consider refactoring if you'll be working in these areas frequently.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-[--text-primary] mb-4 flex items-center gap-2">
                        <Package size={18} className="text-[--accent]" />
                        Dependencies Panel
                    </h2>
                    <div className="card p-5 space-y-4">
                        <p className="text-sm text-[--text-secondary]">
                            Checks health status of npm, PyPI, or Cargo dependencies.
                        </p>

                        <div className="space-y-3">
                            <MetricExplainer
                                name="Active"
                                color="success"
                                description="Published within the last 6 months. Actively maintained."
                            />
                            <MetricExplainer
                                name="Aging"
                                color="warning"
                                description="Last published 6-24 months ago. May need updates or alternatives."
                            />
                            <MetricExplainer
                                name="Abandoned"
                                color="danger"
                                description="No updates in 2+ years. High risk - consider finding alternatives."
                            />
                        </div>

                        <div className="p-3 rounded-lg bg-[--bg-tertiary]">
                            <p className="text-xs text-[--text-muted]">
                                <strong>Health Score:</strong> 100 = all active deps. Below 70 suggests dependency maintenance needed. Below 40 is high risk.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-[--text-primary] mb-4 flex items-center gap-2">
                        <Target size={18} className="text-[--accent]" />
                        Summary Panel
                    </h2>
                    <div className="card p-5 space-y-4">
                        <p className="text-sm text-[--text-secondary]">
                            Overall assessment combining all metrics into actionable scores.
                        </p>

                        <div className="space-y-3">
                            <MetricExplainer
                                name="Overall Health"
                                color="success"
                                description="Combined score from maintenance and dependency health (0-100)."
                            />
                            <MetricExplainer
                                name="Bus Factor"
                                color="warning"
                                description="How many contributors actively touch critical files. 1 = single point of failure, 3+ = well distributed."
                            />
                            <MetricExplainer
                                name="Risk Level"
                                color="muted"
                                description="Low (safe to adopt), Medium (review concerns), High (significant risks)."
                            />
                        </div>

                        <div className="p-3 rounded-lg bg-[--bg-tertiary]">
                            <p className="text-xs text-[--text-muted]">
                                <strong>The Verdict:</strong> Read the verdict text for a human-readable summary of whether this repo is safe to depend on.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Quick Reference */}
                <section>
                    <h2 className="text-lg font-semibold text-[--text-primary] mb-4">
                        Quick Reference
                    </h2>
                    <div className="card p-5">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[--border]">
                                    <th className="text-left py-2 text-[--text-muted] font-medium">Score</th>
                                    <th className="text-left py-2 text-[--text-muted] font-medium">Meaning</th>
                                    <th className="text-left py-2 text-[--text-muted] font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-[--text-secondary]">
                                <tr className="border-b border-[--border]">
                                    <td className="py-2 text-[--success] font-medium">70-100</td>
                                    <td className="py-2">Healthy</td>
                                    <td className="py-2">Safe to adopt</td>
                                </tr>
                                <tr className="border-b border-[--border]">
                                    <td className="py-2 text-[--warning] font-medium">40-69</td>
                                    <td className="py-2">Moderate risk</td>
                                    <td className="py-2">Review highlighted issues</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-[--danger] font-medium">0-39</td>
                                    <td className="py-2">High risk</td>
                                    <td className="py-2">Careful evaluation needed</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

function MetricExplainer({
    name,
    color,
    description
}: {
    name: string;
    color: 'success' | 'warning' | 'danger' | 'muted';
    description: string;
}) {
    const dotColors = {
        success: 'bg-[--success]',
        warning: 'bg-[--warning]',
        danger: 'bg-[--danger]',
        muted: 'bg-[--text-muted]',
    };

    return (
        <div className="flex items-start gap-2">
            <div className={`w-2 h-2 rounded-full mt-1.5 ${dotColors[color]}`} />
            <div>
                <span className="text-sm font-medium text-[--text-primary]">{name}:</span>
                <span className="text-sm text-[--text-muted] ml-1">{description}</span>
            </div>
        </div>
    );
}
