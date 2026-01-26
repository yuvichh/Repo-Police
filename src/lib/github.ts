// GitHub API Service
// Handles all interactions with GitHub REST API

import { RepoInfo, FileNode } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';

// Optional GitHub token for higher rate limits
const getHeaders = () => {
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    return headers;
};

export interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
    author?: {
        login: string;
    };
}

export interface GitHubTreeItem {
    path: string;
    type: 'blob' | 'tree';
    sha: string;
}

export interface CommitFile {
    filename: string;
    status: string;
    changes: number;
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
    // Handle various GitHub URL formats
    const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
        /^([^\/]+)\/([^\/]+)$/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
        }
    }

    return null;
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
        { headers: getHeaders() }
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('REPO_NOT_FOUND');
        }
        if (response.status === 403) {
            throw new Error('RATE_LIMITED');
        }
        throw new Error('UNKNOWN');
    }

    const data = await response.json();

    return {
        owner: data.owner.login,
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        defaultBranch: data.default_branch,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at,
        language: data.language,
        license: data.license?.spdx_id || null,
        topics: data.topics || [],
        size: data.size,
        watchers: data.subscribers_count,
        hasWiki: data.has_wiki,
        hasPages: data.has_pages,
        archived: data.archived,
        isTemplate: data.is_template,
    };
}

export async function fetchRepoTree(
    owner: string,
    repo: string,
    branch: string
): Promise<GitHubTreeItem[]> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers: getHeaders() }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch repository tree');
    }

    const data = await response.json();
    return data.tree || [];
}

export async function fetchRecentCommits(
    owner: string,
    repo: string,
    perPage: number = 100,
    maxPages: number = 3
): Promise<GitHubCommit[]> {
    const allCommits: GitHubCommit[] = [];

    for (let page = 1; page <= maxPages; page++) {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`,
            { headers: getHeaders() }
        );

        if (!response.ok) {
            break;
        }

        const commits = await response.json();
        if (commits.length === 0) break;

        allCommits.push(...commits);

        // Stop if we got less than requested (last page)
        if (commits.length < perPage) break;
    }

    return allCommits;
}

export async function fetchCommitDetails(
    owner: string,
    repo: string,
    sha: string
): Promise<CommitFile[]> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`,
        { headers: getHeaders() }
    );

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    return data.files || [];
}

export async function fetchContributors(
    owner: string,
    repo: string
): Promise<{ login: string; contributions: number }[]> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=100`,
        { headers: getHeaders() }
    );

    if (!response.ok) {
        return [];
    }

    return response.json();
}

export async function fetchFileContent(
    owner: string,
    repo: string,
    path: string
): Promise<string | null> {
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`,
        { headers: getHeaders() }
    );

    if (!response.ok) {
        return null;
    }

    const data = await response.json();

    if (data.encoding === 'base64' && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
    }

    return null;
}

// Build file tree from flat GitHub tree response
export function buildFileTree(items: GitHubTreeItem[]): FileNode {
    const root: FileNode = {
        path: '',
        name: 'root',
        type: 'directory',
        children: [],
    };

    // Filter out very deep paths and common non-essential files
    const filteredItems = items.filter(item => {
        const depth = item.path.split('/').length;
        if (depth > 8) return false;
        if (item.path.includes('node_modules')) return false;
        if (item.path.includes('.git/')) return false;
        if (item.path.startsWith('.')) return false;
        return true;
    });

    for (const item of filteredItems) {
        const parts = item.path.split('/');
        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;
            const currentPath = parts.slice(0, i + 1).join('/');

            if (!current.children) {
                current.children = [];
            }

            let child = current.children.find(c => c.name === part);

            if (!child) {
                child = {
                    path: currentPath,
                    name: part,
                    type: isLast ? (item.type === 'tree' ? 'directory' : 'file') : 'directory',
                    children: isLast && item.type === 'blob' ? undefined : [],
                };
                current.children.push(child);
            }

            current = child;
        }
    }

    // Sort children: directories first, then alphabetically
    const sortChildren = (node: FileNode) => {
        if (node.children) {
            node.children.sort((a, b) => {
                if (a.type === 'directory' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'directory') return 1;
                return a.name.localeCompare(b.name);
            });
            node.children.forEach(sortChildren);
        }
    };

    sortChildren(root);

    return root;
}
