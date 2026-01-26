// Core analysis types for RepoScope

export interface RepoInfo {
    owner: string;
    name: string;
    fullName: string;
    description: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    defaultBranch: string;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    language: string | null;
    license: string | null;
    topics: string[];
    size: number; // KB
    watchers: number;
    hasWiki: boolean;
    hasPages: boolean;
    archived: boolean;
    isTemplate: boolean;
}

export interface FileNode {
    path: string;
    name: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    // Volatility metrics
    commitCount?: number;
    lastModified?: string;
    contributors?: number;
    volatilityScore?: number; // 0-100
    status?: 'hot' | 'stable' | 'cold' | 'abandoned';
}

export interface FileVolatility {
    path: string;
    commitCount: number;
    lastModified: string;
    daysSinceLastModified: number;
    contributors: number;
    volatilityScore: number;
    status: 'hot' | 'stable' | 'cold' | 'abandoned';
}

export interface RiskZone {
    id: string;
    name: string;
    paths: string[];
    riskLevel: 'high' | 'medium' | 'low';
    riskScore: number;
    reasons: string[];
    recommendation?: string;
}

export type DependencyHealth = 'active' | 'aging' | 'abandoned' | 'unknown';

export interface Dependency {
    name: string;
    version: string;
    latestVersion?: string;
    lastPublished?: string;
    daysSincePublished?: number;
    weeklyDownloads?: number;
    maintainerCount?: number;
    health: DependencyHealth;
    healthScore: number; // 0-100
    children?: Dependency[];
    ecosystem: 'npm' | 'pypi' | 'cargo';
}

export interface DependencyAnalysis {
    ecosystem: 'npm' | 'pypi' | 'cargo' | 'unknown';
    totalDependencies: number;
    activeDependencies: number;
    agingDependencies: number;
    abandonedDependencies: number;
    dependencies: Dependency[];
    overallHealthScore: number;
}

export interface AnalysisSummary {
    maintenanceRiskScore: number; // 0-100
    dependencyRiskScore: number; // 0-100
    busFactor: number;
    volatilityConcentration: number;
    verdict: string;
    aiSummary?: string;
    highlights: {
        type: 'positive' | 'warning' | 'danger';
        message: string;
    }[];
}

export interface RepoAnalysis {
    repoInfo: RepoInfo;
    fileTree: FileNode;
    volatileFiles: FileVolatility[];
    riskZones: RiskZone[];
    dependencyAnalysis: DependencyAnalysis;
    summary: AnalysisSummary;
    analyzedAt: string;
}

export interface AnalysisError {
    code: 'INVALID_URL' | 'REPO_NOT_FOUND' | 'RATE_LIMITED' | 'PRIVATE_REPO' | 'UNKNOWN';
    message: string;
}

export type AnalysisResult =
    | { success: true; data: RepoAnalysis }
    | { success: false; error: AnalysisError };
