'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import {
  Search,
  ArrowRight,
  Activity,
  Shield,
  Package,
  BarChart2
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || 'Analysis failed');
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
      router.push('/analyze');
    } catch (err) {
      setError('Failed to analyze repository. Please try again.');
      setIsLoading(false);
    }
  };

  const exampleRepos = [
    'facebook/react',
    'vercel/next.js',
    'tailwindlabs/tailwindcss',
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <LoadingState
          message="Analyzing repository..."
          submessage="This may take 30-60 seconds"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="border-b border-[--border] bg-[--bg-base]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[--accent] flex items-center justify-center">
              <Shield size={16} className="text-[--bg-base]" />
            </div>
            <span className="text-base font-semibold text-[--text-primary]">RepoPolice</span>
          </div>

          <nav className="flex items-center gap-4">
            <a
              href="/guide"
              className="text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors"
            >
              Guide
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[--text-secondary] hover:text-[--text-primary] transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-6 pt-24 pb-16">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[--text-primary] tracking-tight mb-4">
            Know your repository
            <br />
            <span className="text-[--accent]">before you adopt it.</span>
          </h1>
          <p className="text-[--text-secondary] max-w-md mx-auto">
            Analyze codebase health, maintenance risk, and dependency safety
            before depending on a repository.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleAnalyze} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Search size={16} className="text-[--text-muted]" />
              </div>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setError(null);
                }}
                placeholder="owner/repo or GitHub URL"
                className="input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2">
              Analyze
              <ArrowRight size={14} />
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-[--danger]">{error}</p>
          )}
        </form>

        {/* Example repos */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
          <span className="text-sm text-[--text-muted]">Try:</span>
          {exampleRepos.map((repo) => (
            <button
              key={repo}
              onClick={() => setRepoUrl(repo)}
              className="btn-secondary py-1.5 px-3"
            >
              {repo}
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            icon={<Activity size={18} />}
            title="Change Volatility"
            description="Identify hot and abandoned files"
          />
          <FeatureCard
            icon={<Shield size={18} />}
            title="Risk Zones"
            description="Find architectural weak points"
          />
          <FeatureCard
            icon={<Package size={18} />}
            title="Dependency Health"
            description="Check dependency maintenance"
          />
          <FeatureCard
            icon={<BarChart2 size={18} />}
            title="Adoption Score"
            description="Get a clear risk assessment"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[--border] py-6">
        <p className="text-center text-sm text-[--text-muted]">
          No authentication required · Uses GitHub REST API
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[--accent-subtle] flex items-center justify-center text-[--accent]">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-[--text-primary]">{title}</h3>
          <p className="text-xs text-[--text-muted]">{description}</p>
        </div>
      </div>
    </div>
  );
}
