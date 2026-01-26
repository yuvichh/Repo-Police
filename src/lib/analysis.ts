// Core Analysis Algorithms
// Computes volatility, risk zones, bus factor, and overall scores

import { FileNode, FileVolatility, RiskZone, AnalysisSummary, DependencyAnalysis } from '@/types';
import { GitHubCommit, CommitFile } from './github';

// Calculate file volatility metrics
export function analyzeFileVolatility(
    commits: GitHubCommit[],
    commitFiles: Map<string, CommitFile[]>,
    fileTree: FileNode
): { volatileFiles: FileVolatility[]; enrichedTree: FileNode } {
    // Build file stats from commits
    const fileStats = new Map<string, {
        commits: number;
        lastModified: string;
        contributors: Set<string>;
    }>();

    for (const commit of commits) {
        const files = commitFiles.get(commit.sha) || [];
        const author = commit.author?.login || commit.commit.author.name;

        for (const file of files) {
            if (!fileStats.has(file.filename)) {
                fileStats.set(file.filename, {
                    commits: 0,
                    lastModified: commit.commit.author.date,
                    contributors: new Set(),
                });
            }

            const stats = fileStats.get(file.filename)!;
            stats.commits++;
            stats.contributors.add(author);

            // Update last modified if this commit is more recent
            if (new Date(commit.commit.author.date) > new Date(stats.lastModified)) {
                stats.lastModified = commit.commit.author.date;
            }
        }
    }

    // Calculate volatility scores
    const now = new Date();
    const volatileFiles: FileVolatility[] = [];

    // Find max commits for normalization
    let maxCommits = 1;
    fileStats.forEach(stats => {
        if (stats.commits > maxCommits) maxCommits = stats.commits;
    });

    fileStats.forEach((stats, path) => {
        const daysSinceModified = Math.floor(
            (now.getTime() - new Date(stats.lastModified).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Volatility score: higher for frequently changed files
        // Score = normalized commit frequency * recency factor * contributor factor
        const commitScore = (stats.commits / maxCommits) * 50;
        const recencyScore = Math.max(0, 50 - daysSinceModified / 7); // Decays over ~1 year
        const contributorBonus = Math.min(20, stats.contributors.size * 5);

        const volatilityScore = Math.min(100, Math.round(commitScore + recencyScore + contributorBonus));

        // Determine status
        let status: FileVolatility['status'];
        if (daysSinceModified > 365) {
            status = 'abandoned';
        } else if (daysSinceModified > 180) {
            status = 'cold';
        } else if (volatilityScore > 60) {
            status = 'hot';
        } else {
            status = 'stable';
        }

        volatileFiles.push({
            path,
            commitCount: stats.commits,
            lastModified: stats.lastModified,
            daysSinceLastModified: daysSinceModified,
            contributors: stats.contributors.size,
            volatilityScore,
            status,
        });
    });

    // Sort by volatility score (hottest first)
    volatileFiles.sort((a, b) => b.volatilityScore - a.volatilityScore);

    // Enrich file tree with volatility data
    const enrichedTree = enrichTreeWithVolatility(fileTree, volatileFiles);

    return { volatileFiles, enrichedTree };
}

function enrichTreeWithVolatility(tree: FileNode, volatility: FileVolatility[]): FileNode {
    const volatilityMap = new Map(volatility.map(v => [v.path, v]));

    function enrichNode(node: FileNode): FileNode {
        const volatilityData = volatilityMap.get(node.path);

        const enrichedNode: FileNode = {
            ...node,
            commitCount: volatilityData?.commitCount,
            lastModified: volatilityData?.lastModified,
            contributors: volatilityData?.contributors,
            volatilityScore: volatilityData?.volatilityScore,
            status: volatilityData?.status,
        };

        if (node.children) {
            enrichedNode.children = node.children.map(enrichNode);

            // Calculate directory status from children
            if (enrichedNode.children.length > 0) {
                const childStatuses = enrichedNode.children
                    .filter(c => c.status)
                    .map(c => c.status!);

                if (childStatuses.includes('hot')) {
                    enrichedNode.status = 'hot';
                } else if (childStatuses.includes('stable')) {
                    enrichedNode.status = 'stable';
                } else if (childStatuses.includes('cold')) {
                    enrichedNode.status = 'cold';
                } else if (childStatuses.length > 0) {
                    enrichedNode.status = 'abandoned';
                }

                // Sum commit counts for directories
                enrichedNode.commitCount = enrichedNode.children.reduce(
                    (sum, c) => sum + (c.commitCount || 0),
                    0
                );
            }
        }

        return enrichedNode;
    }

    return enrichNode(tree);
}

// Identify risk zones in the codebase
export function identifyRiskZones(
    volatileFiles: FileVolatility[],
    totalContributors: number
): RiskZone[] {
    const riskZones: RiskZone[] = [];

    // Find directories with concentrated volatility
    const dirStats = new Map<string, {
        files: FileVolatility[];
        totalCommits: number;
        uniqueContributors: Set<string>;
    }>();

    for (const file of volatileFiles) {
        const dir = file.path.split('/').slice(0, -1).join('/') || '/';

        if (!dirStats.has(dir)) {
            dirStats.set(dir, {
                files: [],
                totalCommits: 0,
                uniqueContributors: new Set(),
            });
        }

        const stats = dirStats.get(dir)!;
        stats.files.push(file);
        stats.totalCommits += file.commitCount;
    }

    // Identify high-risk zones
    dirStats.forEach((stats, dir) => {
        const hotFiles = stats.files.filter(f => f.status === 'hot');
        const abandonedFiles = stats.files.filter(f => f.status === 'abandoned');
        const avgVolatility = stats.files.reduce((sum, f) => sum + f.volatilityScore, 0) / stats.files.length;

        const reasons: string[] = [];
        let riskScore = 0;

        // High churn
        if (hotFiles.length >= 3 || (hotFiles.length > 0 && hotFiles.length / stats.files.length > 0.5)) {
            reasons.push(`${hotFiles.length} frequently changing files`);
            riskScore += 30;
        }

        // Many contributors (bus factor risk)
        const avgContributors = stats.files.reduce((sum, f) => sum + f.contributors, 0) / stats.files.length;
        if (avgContributors >= 3) {
            reasons.push(`Touched by ${Math.round(avgContributors)} contributors on average`);
            riskScore += 20;
        }

        // Abandoned code
        if (abandonedFiles.length >= 2) {
            reasons.push(`${abandonedFiles.length} abandoned files`);
            riskScore += 25;
        }

        // High overall volatility
        if (avgVolatility > 60) {
            reasons.push(`High average volatility (${Math.round(avgVolatility)}%)`);
            riskScore += 25;
        }

        if (reasons.length >= 2 && riskScore > 30) {
            let riskLevel: RiskZone['riskLevel'] = 'low';
            if (riskScore >= 60) riskLevel = 'high';
            else if (riskScore >= 40) riskLevel = 'medium';

            const zone: RiskZone = {
                id: `zone-${riskZones.length + 1}`,
                name: dir || 'Root',
                paths: stats.files.map(f => f.path),
                riskLevel,
                riskScore: Math.min(100, riskScore),
                reasons,
                recommendation: getRiskRecommendation(reasons, riskLevel),
            };

            riskZones.push(zone);
        }
    });

    // Sort by risk score
    riskZones.sort((a, b) => b.riskScore - a.riskScore);

    // Limit to top 5 risk zones
    return riskZones.slice(0, 5);
}

function getRiskRecommendation(reasons: string[], level: RiskZone['riskLevel']): string {
    if (level === 'high') {
        return 'Consider adding comprehensive tests, documentation, and code review requirements for changes in this area.';
    }
    if (level === 'medium') {
        return 'Monitor changes in this area and ensure knowledge sharing among team members.';
    }
    return 'Keep an eye on this area during regular maintenance.';
}

// Calculate bus factor
export function calculateBusFactor(
    volatileFiles: FileVolatility[],
    totalContributors: number
): number {
    if (totalContributors <= 1) return 1;

    // Simple bus factor: how many contributors touch critical (hot) files
    const hotFiles = volatileFiles.filter(f => f.status === 'hot');

    if (hotFiles.length === 0) {
        return Math.min(totalContributors, 5);
    }

    // Average contributors per hot file
    const avgContributors = hotFiles.reduce((sum, f) => sum + f.contributors, 0) / hotFiles.length;

    return Math.max(1, Math.min(Math.round(avgContributors), totalContributors));
}

// Generate analysis summary
export function generateSummary(
    volatileFiles: FileVolatility[],
    riskZones: RiskZone[],
    dependencyAnalysis: DependencyAnalysis,
    busFactor: number,
    totalContributors: number
): AnalysisSummary {
    // Calculate maintenance risk score (0-100, lower is better)
    const hotFileRatio = volatileFiles.filter(f => f.status === 'hot').length / Math.max(volatileFiles.length, 1);
    const abandonedFileRatio = volatileFiles.filter(f => f.status === 'abandoned').length / Math.max(volatileFiles.length, 1);
    const avgRiskZoneScore = riskZones.length > 0
        ? riskZones.reduce((sum, z) => sum + z.riskScore, 0) / riskZones.length
        : 0;

    const maintenanceRiskScore = Math.round(
        (hotFileRatio * 30) +
        (abandonedFileRatio * 30) +
        (avgRiskZoneScore * 0.4)
    );

    // Dependency risk score (inverted health score)
    const dependencyRiskScore = 100 - dependencyAnalysis.overallHealthScore;

    // Volatility concentration (how focused is the churn)
    const topHotFiles = volatileFiles.filter(f => f.status === 'hot').slice(0, 5);
    const topChurn = topHotFiles.reduce((sum, f) => sum + f.commitCount, 0);
    const totalChurn = volatileFiles.reduce((sum, f) => sum + f.commitCount, 0);
    const volatilityConcentration = totalChurn > 0 ? Math.round((topChurn / totalChurn) * 100) : 0;

    // Generate highlights
    const highlights: AnalysisSummary['highlights'] = [];

    // Positive highlights
    if (maintenanceRiskScore < 30) {
        highlights.push({ type: 'positive', message: 'Codebase is well-maintained with low volatility risk' });
    }
    if (dependencyAnalysis.abandonedDependencies === 0) {
        highlights.push({ type: 'positive', message: 'No abandoned dependencies detected' });
    }
    if (busFactor >= 3) {
        highlights.push({ type: 'positive', message: `Good bus factor of ${busFactor} - knowledge is distributed` });
    }

    // Warning highlights
    if (hotFileRatio > 0.2) {
        highlights.push({ type: 'warning', message: `${Math.round(hotFileRatio * 100)}% of files are highly volatile` });
    }
    if (dependencyAnalysis.agingDependencies > 0) {
        highlights.push({ type: 'warning', message: `${dependencyAnalysis.agingDependencies} dependencies showing signs of age` });
    }
    if (volatilityConcentration > 70) {
        highlights.push({ type: 'warning', message: 'Changes are concentrated in a few files' });
    }

    // Danger highlights
    if (abandonedFileRatio > 0.3) {
        highlights.push({ type: 'danger', message: `${Math.round(abandonedFileRatio * 100)}% of files appear abandoned` });
    }
    if (dependencyAnalysis.abandonedDependencies > 0) {
        highlights.push({ type: 'danger', message: `${dependencyAnalysis.abandonedDependencies} abandoned dependencies need attention` });
    }
    if (busFactor === 1) {
        highlights.push({ type: 'danger', message: 'Critical bus factor: only 1 active contributor' });
    }
    if (riskZones.filter(z => z.riskLevel === 'high').length > 0) {
        highlights.push({ type: 'danger', message: `${riskZones.filter(z => z.riskLevel === 'high').length} high-risk zones identified` });
    }

    // Generate verdict
    const overallRisk = (maintenanceRiskScore + dependencyRiskScore) / 2;
    let verdict: string;

    if (overallRisk < 25) {
        verdict = 'This repository is healthy and safe to adopt. It shows good maintenance practices with stable dependencies.';
    } else if (overallRisk < 50) {
        verdict = 'This repository is reasonably maintained but has some areas of concern. Review the highlighted issues before adoption.';
    } else if (overallRisk < 75) {
        verdict = 'This repository has significant maintenance concerns. Careful evaluation is recommended before depending on it.';
    } else {
        verdict = 'This repository shows signs of neglect with high risk factors. Adoption is not recommended without significant investment.';
    }

    return {
        maintenanceRiskScore,
        dependencyRiskScore,
        busFactor,
        volatilityConcentration,
        verdict,
        highlights: highlights.slice(0, 6), // Limit highlights
    };
}
