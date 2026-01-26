// Main Analysis API Route
import { NextRequest, NextResponse } from 'next/server';
import {
    parseRepoUrl,
    fetchRepoInfo,
    fetchRepoTree,
    fetchRecentCommits,
    fetchCommitDetails,
    fetchContributors,
    fetchFileContent,
    buildFileTree,
    CommitFile,
} from '@/lib/github';
import {
    detectEcosystem,
    parsePackageJson,
    parseRequirementsTxt,
    parseCargoToml,
    analyzeDependencies,
    ParsedDependency,
} from '@/lib/dependency-parser';
import {
    analyzeFileVolatility,
    identifyRiskZones,
    calculateBusFactor,
    generateSummary,
} from '@/lib/analysis';
import { RepoAnalysis, AnalysisError, DependencyAnalysis } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { repoUrl } = body;

        if (!repoUrl) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_URL', message: 'Repository URL is required' } },
                { status: 400 }
            );
        }

        const parsed = parseRepoUrl(repoUrl);
        if (!parsed) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_URL', message: 'Invalid GitHub repository URL' } },
                { status: 400 }
            );
        }

        const { owner, repo } = parsed;

        // Fetch repo info
        let repoInfo;
        try {
            repoInfo = await fetchRepoInfo(owner, repo);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'UNKNOWN';
            if (message === 'REPO_NOT_FOUND') {
                return NextResponse.json(
                    { success: false, error: { code: 'REPO_NOT_FOUND', message: 'Repository not found or is private' } as AnalysisError },
                    { status: 404 }
                );
            }
            if (message === 'RATE_LIMITED') {
                return NextResponse.json(
                    { success: false, error: { code: 'RATE_LIMITED', message: 'GitHub API rate limit exceeded. Try again later.' } as AnalysisError },
                    { status: 429 }
                );
            }
            throw error;
        }

        // Fetch repository tree
        const treeItems = await fetchRepoTree(owner, repo, repoInfo.defaultBranch);
        const fileTree = buildFileTree(treeItems);

        // Get file paths for ecosystem detection
        const filePaths = treeItems.filter(item => item.type === 'blob').map(item => item.path);
        const rootFiles = filePaths.filter(p => !p.includes('/'));

        // Fetch recent commits
        const commits = await fetchRecentCommits(owner, repo, 100, 2);

        // Fetch commit details for file changes (limit to recent commits to avoid rate limits)
        const recentCommits = commits.slice(0, 50);
        const commitFiles = new Map<string, CommitFile[]>();

        // Batch fetch commit details
        const batchSize = 5;
        for (let i = 0; i < recentCommits.length; i += batchSize) {
            const batch = recentCommits.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map(async (commit) => {
                    const files = await fetchCommitDetails(owner, repo, commit.sha);
                    return { sha: commit.sha, files };
                })
            );
            results.forEach(({ sha, files }) => {
                commitFiles.set(sha, files);
            });
        }

        // Analyze file volatility
        const { volatileFiles, enrichedTree } = analyzeFileVolatility(
            recentCommits,
            commitFiles,
            fileTree
        );

        // Fetch contributors
        const contributors = await fetchContributors(owner, repo);
        const totalContributors = contributors.length;

        // Identify risk zones
        const riskZones = identifyRiskZones(volatileFiles, totalContributors);

        // Calculate bus factor
        const busFactor = calculateBusFactor(volatileFiles, totalContributors);

        // Analyze dependencies
        const ecosystem = detectEcosystem(rootFiles);
        let dependencyAnalysis: DependencyAnalysis = {
            ecosystem: 'unknown',
            totalDependencies: 0,
            activeDependencies: 0,
            agingDependencies: 0,
            abandonedDependencies: 0,
            dependencies: [],
            overallHealthScore: 100,
        };

        if (ecosystem !== 'unknown') {
            let manifestContent: string | null = null;
            let parsedDeps: ParsedDependency[] = [];

            if (ecosystem === 'npm') {
                manifestContent = await fetchFileContent(owner, repo, 'package.json');
                if (manifestContent) {
                    parsedDeps = parsePackageJson(manifestContent);
                }
            } else if (ecosystem === 'pypi') {
                manifestContent = await fetchFileContent(owner, repo, 'requirements.txt');
                if (manifestContent) {
                    parsedDeps = parseRequirementsTxt(manifestContent);
                }
            } else if (ecosystem === 'cargo') {
                manifestContent = await fetchFileContent(owner, repo, 'Cargo.toml');
                if (manifestContent) {
                    parsedDeps = parseCargoToml(manifestContent);
                }
            }

            if (parsedDeps.length > 0) {
                // Limit dependencies to check (to avoid long wait times)
                const depsToCheck = parsedDeps.slice(0, 20);
                dependencyAnalysis = await analyzeDependencies(ecosystem, depsToCheck);
            }
        }

        // Generate summary
        const summary = generateSummary(
            volatileFiles,
            riskZones,
            dependencyAnalysis,
            busFactor,
            totalContributors
        );

        const analysis: RepoAnalysis = {
            repoInfo,
            fileTree: enrichedTree,
            volatileFiles: volatileFiles.slice(0, 50), // Top 50 most volatile
            riskZones,
            dependencyAnalysis,
            summary,
            analyzedAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, data: analysis });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'UNKNOWN', message: 'An unexpected error occurred' } as AnalysisError },
            { status: 500 }
        );
    }
}
