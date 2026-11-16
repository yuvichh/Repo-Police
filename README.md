# RepoPolice

**Know your repository before you adopt it.**

RepoPolice is a GitHub repository health analyzer that helps developers make informed decisions about the repositories they depend on. It provides deep analysis of codebase health, maintenance risk, and dependency safety.

![Status](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Features

### Change Volatility Analysis
- Identifies **hot files** (frequently changing, potentially unstable)
- Detects **stable files** (healthy maintenance patterns)
- Flags **cold/abandoned files** (no recent updates)
- Interactive file tree with commit frequency visualization

### Risk Zone Detection
- Discovers architectural weak points in the codebase
- Highlights directories with elevated maintenance risk
- Provides actionable recommendations for each risk zone
- Categorizes risks by severity (High/Medium/Low)

### Dependency Health Check
- Checks npm, PyPI, and Cargo dependencies
- Identifies **active**, **aging**, and **abandoned** packages
- Calculates overall dependency health score
- Shows last publish dates and maintenance status

### Repository Insights
- **License detection** with compatibility warnings
- **Repository age** and activity timeline
- **Commit frequency** analysis (High/Moderate/Low)
- **Contributor count** and distribution
- **Bus factor** calculation (risk of key person dependency)
- Topics/tags and GitHub metrics (stars, forks, watchers)

### Adoption Score
- Combined health score (0-100)
- Clear risk assessment (Low/Medium/High)
- Human-readable verdict explaining adoption safety
- Highlighted positives and warnings

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) or Node.js 18+
- GitHub account (for API token, optional but recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/yuvichh/Repo-Police.git
cd repo-police

# Install dependencies
bun install

# Set up environment variables (optional but recommended)
cp .env.example .env
# Add your GitHub token to .env
```

### Environment Variables

Create a `.env` file with:

```env
# GitHub Personal Access Token (optional but recommended)
# Get one from: https://github.com/settings/tokens
# Create a "classic" token with 'public_repo' scope
# Without a token: 60 requests/hour
# With a token: 5,000 requests/hour
GITHUB_TOKEN=your_github_token_here
```

### Running Locally

```bash
# Development mode
bun dev

# Production build
bun run build
bun start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Enter a repository** - Type a GitHub URL or `owner/repo` format
2. **Click Analyze** - Wait 30-60 seconds for the analysis
3. **Review the dashboard** - Explore all panels:
   - Repository Insights - Basic info, license, activity
   - Summary - Overall health scores and verdict
   - Activity Overview - Interactive charts
   - Change Volatility - File tree with status indicators
   - Risk Zones - Problem areas in the codebase
   - Dependencies - Package health status

### Score Interpretation

| Score | Risk Level | Meaning |
|-------|------------|---------|
| 70-100 | Low | Safe to adopt |
| 40-69 | Medium | Review highlighted issues |
| 0-39 | High | Careful evaluation needed |

---

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Runtime**: Bun
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Charts**: Recharts
- **Icons**: Lucide React
- **API**: GitHub REST API

---

## Project Structure

```
repo-police/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── analyze/         # Analysis dashboard
│   │   ├── guide/           # How-to-read guide
│   │   └── api/analyze/     # API route
│   ├── components/
│   │   ├── panels/          # Dashboard panels
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Core logic
│   │   ├── github.ts        # GitHub API client
│   │   ├── analyzer.ts      # Analysis engine
│   │   └── dependency-parser.ts
│   └── types/               # TypeScript types
├── public/                  # Static assets
└── .env.example             # Environment template
```

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [GitHub REST API](https://docs.github.com/en/rest) for repository data
- [npm Registry API](https://github.com/npm/registry) for package health
- [CHAOSS Metrics](https://chaoss.community/) for open-source health metrics inspiration

---

Developed by [Yuvraj](https://github.com/yuvichh)
