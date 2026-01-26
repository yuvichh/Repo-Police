'use client';

import { useState, ReactNode } from 'react';
import { ChevronRight, Folder, FolderOpen, FileCode, File as FileIcon } from 'lucide-react';
import { FileNode } from '@/types';
import { StatusDot } from './Badge';

interface TreeViewProps {
    data: FileNode;
    onNodeClick?: (node: FileNode) => void;
    depth?: number;
    defaultCollapsed?: boolean;
}

export function TreeView({ data, onNodeClick, depth = 0, defaultCollapsed = true }: TreeViewProps) {
    // Only expand root by default if not collapsed, otherwise keep everything collapsed
    const [expanded, setExpanded] = useState(depth === 0 && !defaultCollapsed);

    const hasChildren = data.type === 'directory' && data.children && data.children.length > 0;

    const getStatusType = (status?: string): 'success' | 'warning' | 'danger' | 'muted' => {
        switch (status) {
            case 'hot': return 'danger';
            case 'stable': return 'success';
            case 'cold': return 'muted';
            case 'abandoned': return 'muted';
            default: return 'muted';
        }
    };

    const handleClick = () => {
        if (hasChildren) {
            setExpanded(!expanded);
        }
        onNodeClick?.(data);
    };

    // Get appropriate icon
    const Icon = () => {
        if (data.type === 'directory') {
            return expanded ? (
                <FolderOpen size={12} className="text-[--text-muted]" />
            ) : (
                <Folder size={12} className="text-[--text-muted]" />
            );
        }

        const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go', '.java', '.cpp', '.c', '.h'];
        const isCode = codeExtensions.some(ext => data.name.endsWith(ext));

        return isCode ? (
            <FileCode size={12} className="text-[--text-muted]" />
        ) : (
            <FileIcon size={12} className="text-[--text-muted]" />
        );
    };

    return (
        <div style={{ marginLeft: depth > 0 ? 12 : 0 }}>
            <div className="tree-item" onClick={handleClick}>
                <span
                    className="transition-transform duration-100"
                    style={{
                        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        opacity: hasChildren ? 1 : 0,
                        width: 10,
                    }}
                >
                    <ChevronRight size={10} className="text-[--text-faint]" />
                </span>

                <Icon />

                {data.status && <StatusDot status={getStatusType(data.status)} />}

                <span className="flex-1 truncate text-[--text-secondary] text-xs">
                    {data.name}
                </span>

                {data.commitCount !== undefined && data.commitCount > 0 && (
                    <span className="text-[9px] text-[--text-faint] bg-[--bg-tertiary] px-1 py-0.5 rounded">
                        {data.commitCount}
                    </span>
                )}
            </div>

            {hasChildren && expanded && (
                <div className="border-l border-[--border] ml-1">
                    {data.children!.map((child, index) => (
                        <TreeView
                            key={`${child.path}-${index}`}
                            data={child}
                            onNodeClick={onNodeClick}
                            depth={depth + 1}
                            defaultCollapsed={defaultCollapsed}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface DependencyListProps {
    dependencies: Array<{
        name: string;
        version: string;
        health: 'active' | 'aging' | 'abandoned' | 'unknown';
        lastPublished?: string;
    }>;
}

export function DependencyList({ dependencies }: DependencyListProps) {
    const getStatusType = (health: string): 'success' | 'warning' | 'danger' | 'muted' => {
        switch (health) {
            case 'active': return 'success';
            case 'aging': return 'warning';
            case 'abandoned': return 'danger';
            default: return 'muted';
        }
    };

    return (
        <div className="divide-y divide-[--border]">
            {dependencies.map((dep, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2 py-1.5">
                    <StatusDot status={getStatusType(dep.health)} />
                    <span className="font-mono text-xs text-[--text-primary] truncate flex-1">{dep.name}</span>
                    <span className="text-[10px] text-[--text-muted]">{dep.version}</span>
                </div>
            ))}
        </div>
    );
}
