// Dependency Parser
// Parses package manifests from various ecosystems

import { Dependency, DependencyAnalysis } from '@/types';

export type Ecosystem = 'npm' | 'pypi' | 'cargo' | 'unknown';

export interface ParsedDependency {
    name: string;
    version: string;
    isDev: boolean;
}

export function detectEcosystem(files: string[]): Ecosystem {
    if (files.includes('package.json')) return 'npm';
    if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'pypi';
    if (files.includes('Cargo.toml')) return 'cargo';
    return 'unknown';
}

export function parsePackageJson(content: string): ParsedDependency[] {
    try {
        const pkg = JSON.parse(content);
        const dependencies: ParsedDependency[] = [];

        // Regular dependencies
        if (pkg.dependencies) {
            for (const [name, version] of Object.entries(pkg.dependencies)) {
                dependencies.push({
                    name,
                    version: cleanVersion(version as string),
                    isDev: false,
                });
            }
        }

        // Dev dependencies (still track but mark them)
        if (pkg.devDependencies) {
            for (const [name, version] of Object.entries(pkg.devDependencies)) {
                dependencies.push({
                    name,
                    version: cleanVersion(version as string),
                    isDev: true,
                });
            }
        }

        return dependencies;
    } catch {
        return [];
    }
}

export function parseRequirementsTxt(content: string): ParsedDependency[] {
    const dependencies: ParsedDependency[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) {
            continue;
        }

        // Parse various requirement formats
        // package==1.0.0, package>=1.0.0, package~=1.0.0, package
        const match = trimmed.match(/^([a-zA-Z0-9_-]+)(?:\[.*?\])?(?:([=<>~!]+)(.+))?$/);

        if (match) {
            dependencies.push({
                name: match[1],
                version: match[3] || 'latest',
                isDev: false,
            });
        }
    }

    return dependencies;
}

export function parseCargoToml(content: string): ParsedDependency[] {
    const dependencies: ParsedDependency[] = [];

    // Simple TOML parsing for [dependencies] section
    const lines = content.split('\n');
    let inDependencies = false;
    let inDevDependencies = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === '[dependencies]') {
            inDependencies = true;
            inDevDependencies = false;
            continue;
        }

        if (trimmed === '[dev-dependencies]') {
            inDependencies = false;
            inDevDependencies = true;
            continue;
        }

        if (trimmed.startsWith('[')) {
            inDependencies = false;
            inDevDependencies = false;
            continue;
        }

        if (inDependencies || inDevDependencies) {
            // Parse: package = "1.0" or package = { version = "1.0" }
            const simpleMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*"(.+)"$/);
            const complexMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{.*version\s*=\s*"([^"]+)".*\}$/);

            const match = simpleMatch || complexMatch;

            if (match) {
                dependencies.push({
                    name: match[1],
                    version: match[2],
                    isDev: inDevDependencies,
                });
            }
        }
    }

    return dependencies;
}

function cleanVersion(version: string): string {
    // Remove common prefixes like ^, ~, >=, etc.
    return version.replace(/^[\^~>=<]+/, '');
}

// npm Registry API
export async function checkNpmPackage(name: string): Promise<Partial<Dependency> | null> {
    try {
        const response = await fetch(`https://registry.npmjs.org/${name}`);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const latestVersion = data['dist-tags']?.latest;
        const latestData = data.versions?.[latestVersion];

        if (!latestData) {
            return null;
        }

        // Get publish date
        const publishDate = data.time?.[latestVersion];
        const daysSincePublished = publishDate
            ? Math.floor((Date.now() - new Date(publishDate).getTime()) / (1000 * 60 * 60 * 24))
            : undefined;

        // Determine health based on days since last publish
        let health: Dependency['health'] = 'active';
        let healthScore = 100;

        if (daysSincePublished !== undefined) {
            if (daysSincePublished > 365 * 2) {
                health = 'abandoned';
                healthScore = 20;
            } else if (daysSincePublished > 365) {
                health = 'aging';
                healthScore = 50;
            } else if (daysSincePublished > 180) {
                health = 'aging';
                healthScore = 70;
            }
        }

        return {
            latestVersion,
            lastPublished: publishDate,
            daysSincePublished,
            health,
            healthScore,
            ecosystem: 'npm',
        };
    } catch {
        return null;
    }
}

// PyPI API
export async function checkPyPiPackage(name: string): Promise<Partial<Dependency> | null> {
    try {
        const response = await fetch(`https://pypi.org/pypi/${name}/json`);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const info = data.info;
        const releases = data.releases;

        // Get latest release date
        const latestVersion = info.version;
        const releaseData = releases[latestVersion];
        const uploadTime = releaseData?.[0]?.upload_time;

        const daysSincePublished = uploadTime
            ? Math.floor((Date.now() - new Date(uploadTime).getTime()) / (1000 * 60 * 60 * 24))
            : undefined;

        let health: Dependency['health'] = 'active';
        let healthScore = 100;

        if (daysSincePublished !== undefined) {
            if (daysSincePublished > 365 * 2) {
                health = 'abandoned';
                healthScore = 20;
            } else if (daysSincePublished > 365) {
                health = 'aging';
                healthScore = 50;
            } else if (daysSincePublished > 180) {
                health = 'aging';
                healthScore = 70;
            }
        }

        return {
            latestVersion,
            lastPublished: uploadTime,
            daysSincePublished,
            health,
            healthScore,
            ecosystem: 'pypi',
        };
    } catch {
        return null;
    }
}

// Crates.io API
export async function checkCratesPackage(name: string): Promise<Partial<Dependency> | null> {
    try {
        const response = await fetch(`https://crates.io/api/v1/crates/${name}`, {
            headers: {
                'User-Agent': 'RepoScope/1.0',
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const crate = data.crate;

        const latestVersion = crate.newest_version;
        const updatedAt = crate.updated_at;

        const daysSincePublished = updatedAt
            ? Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
            : undefined;

        let health: Dependency['health'] = 'active';
        let healthScore = 100;

        if (daysSincePublished !== undefined) {
            if (daysSincePublished > 365 * 2) {
                health = 'abandoned';
                healthScore = 20;
            } else if (daysSincePublished > 365) {
                health = 'aging';
                healthScore = 50;
            } else if (daysSincePublished > 180) {
                health = 'aging';
                healthScore = 70;
            }
        }

        return {
            latestVersion,
            lastPublished: updatedAt,
            daysSincePublished,
            health,
            healthScore,
            ecosystem: 'cargo',
        };
    } catch {
        return null;
    }
}

export async function analyzeDependencies(
    ecosystem: Ecosystem,
    parsedDeps: ParsedDependency[]
): Promise<DependencyAnalysis> {
    const dependencies: Dependency[] = [];

    // Limit concurrent requests
    const batchSize = 5;

    for (let i = 0; i < parsedDeps.length; i += batchSize) {
        const batch = parsedDeps.slice(i, i + batchSize);

        const results = await Promise.all(
            batch.map(async (dep) => {
                let packageInfo: Partial<Dependency> | null = null;

                if (ecosystem === 'npm') {
                    packageInfo = await checkNpmPackage(dep.name);
                } else if (ecosystem === 'pypi') {
                    packageInfo = await checkPyPiPackage(dep.name);
                } else if (ecosystem === 'cargo') {
                    packageInfo = await checkCratesPackage(dep.name);
                }

                return {
                    name: dep.name,
                    version: dep.version,
                    latestVersion: packageInfo?.latestVersion,
                    lastPublished: packageInfo?.lastPublished,
                    daysSincePublished: packageInfo?.daysSincePublished,
                    health: packageInfo?.health || 'unknown',
                    healthScore: packageInfo?.healthScore || 50,
                    ecosystem,
                } as Dependency;
            })
        );

        dependencies.push(...results);
    }

    // Calculate summary stats
    const activeDeps = dependencies.filter(d => d.health === 'active').length;
    const agingDeps = dependencies.filter(d => d.health === 'aging').length;
    const abandonedDeps = dependencies.filter(d => d.health === 'abandoned').length;

    const overallHealthScore = dependencies.length > 0
        ? Math.round(dependencies.reduce((sum, d) => sum + d.healthScore, 0) / dependencies.length)
        : 100;

    return {
        ecosystem,
        totalDependencies: dependencies.length,
        activeDependencies: activeDeps,
        agingDependencies: agingDeps,
        abandonedDependencies: abandonedDeps,
        dependencies,
        overallHealthScore,
    };
}
