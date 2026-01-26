'use client';

import { RepoInfo } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import {
    Info,
    Calendar,
    Scale,
    Tag,
    GitBranch,
    Clock,
    Archive,
    FileCode,
    Users,
    Eye,
    AlertTriangle
} from 'lucide-react';

interface RepoInsightsPanelProps {
    repoInfo: RepoInfo;
    contributorCount: number;
    commitFrequency: string;
}

export function RepoInsightsPanel({ repoInfo, contributorCount, commitFrequency }: RepoInsightsPanelProps) {
    const createdDate = new Date(repoInfo.createdAt);
    const lastPushDate = new Date(repoInfo.pushedAt);
    const daysSinceLastPush = Math.floor((Date.now() - lastPushDate.getTime()) / (1000 * 60 * 60 * 24));
    const repoAge = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

    const formatSize = (kb: number) => {
        if (kb >= 1000000) return `${(kb / 1000000).toFixed(1)} GB`;
        if (kb >= 1000) return `${(kb / 1000).toFixed(1)} MB`;
        return `${kb} KB`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="p-4">
            <CardHeader
                title="Repository Insights"
                subtitle="Key information at a glance"
                icon={<Info size={16} />}
            />

            {/* Warnings */}
            {repoInfo.archived && (
                <div className="mb-4 p-3 rounded-lg bg-[--warning-subtle] border border-[--warning]/20 flex items-center gap-2">
                    <Archive size={14} className="text-[--warning]" />
                    <span className="text-xs text-[--warning]">This repository is archived (read-only)</span>
                </div>
            )}

            {daysSinceLastPush > 365 && !repoInfo.archived && (
                <div className="mb-4 p-3 rounded-lg bg-[--warning-subtle] border border-[--warning]/20 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-[--warning]" />
                    <span className="text-xs text-[--warning]">No commits in over a year</span>
                </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
                <InfoItem
                    icon={<Scale size={12} />}
                    label="License"
                    value={repoInfo.license || 'None specified'}
                    warning={!repoInfo.license}
                />
                <InfoItem
                    icon={<Calendar size={12} />}
                    label="Age"
                    value={repoAge > 0 ? `${repoAge} year${repoAge > 1 ? 's' : ''}` : 'New'}
                />
                <InfoItem
                    icon={<Clock size={12} />}
                    label="Last Push"
                    value={daysSinceLastPush === 0 ? 'Today' : `${daysSinceLastPush}d ago`}
                    warning={daysSinceLastPush > 180}
                />
                <InfoItem
                    icon={<GitBranch size={12} />}
                    label="Commit Rate"
                    value={commitFrequency}
                />
                <InfoItem
                    icon={<Users size={12} />}
                    label="Contributors"
                    value={contributorCount.toString()}
                />
                <InfoItem
                    icon={<Eye size={12} />}
                    label="Watchers"
                    value={repoInfo.watchers.toString()}
                />
                <InfoItem
                    icon={<FileCode size={12} />}
                    label="Size"
                    value={formatSize(repoInfo.size)}
                />
                <InfoItem
                    icon={<AlertTriangle size={12} />}
                    label="Open Issues"
                    value={repoInfo.openIssues.toString()}
                    warning={repoInfo.openIssues > 100}
                />
            </div>

            {/* Topics */}
            {repoInfo.topics.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[--border]">
                    <div className="flex items-center gap-1.5 text-[10px] text-[--text-muted] mb-2">
                        <Tag size={10} />
                        Topics
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {repoInfo.topics.slice(0, 8).map(topic => (
                            <span
                                key={topic}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-[--accent-subtle] text-[--accent]"
                            >
                                {topic}
                            </span>
                        ))}
                        {repoInfo.topics.length > 8 && (
                            <span className="text-[10px] text-[--text-muted]">
                                +{repoInfo.topics.length - 8} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="mt-4 pt-4 border-t border-[--border]">
                <div className="text-[10px] text-[--text-muted] mb-2">Timeline</div>
                <div className="space-y-1.5">
                    <TimelineItem label="Created" date={formatDate(repoInfo.createdAt)} />
                    <TimelineItem label="Last updated" date={formatDate(repoInfo.updatedAt)} />
                    <TimelineItem label="Last push" date={formatDate(repoInfo.pushedAt)} />
                </div>
            </div>
        </Card>
    );
}

function InfoItem({
    icon,
    label,
    value,
    warning = false
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    warning?: boolean;
}) {
    return (
        <div className="p-2.5 rounded-lg bg-[--bg-tertiary]">
            <div className="flex items-center gap-1.5 text-[10px] text-[--text-muted] mb-0.5">
                {icon}
                {label}
            </div>
            <div className={`text-sm font-medium ${warning ? 'text-[--warning]' : 'text-[--text-primary]'}`}>
                {value}
            </div>
        </div>
    );
}

function TimelineItem({ label, date }: { label: string; date: string }) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-[--text-muted]">{label}</span>
            <span className="text-[--text-secondary]">{date}</span>
        </div>
    );
}
