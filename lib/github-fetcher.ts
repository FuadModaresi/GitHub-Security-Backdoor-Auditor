export interface FetchedRepoData {
  owner: string;
  repo: string;
  full_name: string;
  description: string;
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  default_branch: string;
  language: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  license?: string;
  recent_commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
    verified: boolean;
  }>;
  manifest_content?: {
    type: 'package.json' | 'requirements.txt' | 'Cargo.toml' | 'go.mod' | 'other';
    content: string;
    parsed?: any;
  };
  sample_files: Array<{
    path: string;
    content: string;
  }>;
  file_tree: string[];
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleaned = url.trim().replace(/\/+$/, '');
    // Match github.com/owner/repo or owner/repo
    const match = cleaned.match(/(?:github\.com\/|^)([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/);
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  } catch {
    return null;
  }
}

export async function fetchRepositoryData(url: string): Promise<FetchedRepoData | null> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) return null;

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    'User-Agent': 'SentinelAudit-GitHub-Scanner/1.0',
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    // 1. Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 60 },
    });

    if (!repoRes.ok) {
      console.warn(`GitHub API repo query returned ${repoRes.status}`);
      return null;
    }

    const repoMeta = await repoRes.json();
    const defaultBranch = repoMeta.default_branch || 'main';

    // 2. Fetch recent commits
    let recentCommits: FetchedRepoData['recent_commits'] = [];
    try {
      const commitRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=8`,
        { headers, next: { revalidate: 60 } }
      );
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        if (Array.isArray(commitData)) {
          recentCommits = commitData.map((c: any) => ({
            sha: c.sha?.slice(0, 7) || '',
            message: c.commit?.message?.split('\n')[0] || '',
            author: c.commit?.author?.name || c.author?.login || 'anonymous',
            date: c.commit?.author?.date || '',
            verified: Boolean(c.commit?.verification?.verified),
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to fetch commit list:', e);
    }

    // 3. Fetch manifest file from raw GitHub
    let manifestData: FetchedRepoData['manifest_content'] | undefined;
    const manifestCandidates = [
      { name: 'package.json', type: 'package.json' as const },
      { name: 'requirements.txt', type: 'requirements.txt' as const },
      { name: 'Cargo.toml', type: 'Cargo.toml' as const },
      { name: 'go.mod', type: 'go.mod' as const },
    ];

    for (const candidate of manifestCandidates) {
      try {
        const rawRes = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${candidate.name}`
        );
        if (rawRes.ok) {
          const text = await rawRes.text();
          let parsedJson: any = null;
          if (candidate.type === 'package.json') {
            try {
              parsedJson = JSON.parse(text);
            } catch {
              // ignore json parse error
            }
          }
          manifestData = {
            type: candidate.type,
            content: text.slice(0, 8000),
            parsed: parsedJson,
          };
          break;
        }
      } catch {
        // try next candidate
      }
    }

    // 4. Fetch repo contents/tree
    const fileTree: string[] = [];
    const sampleFiles: Array<{ path: string; content: string }> = [];

    try {
      const contentsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents`,
        { headers }
      );
      if (contentsRes.ok) {
        const contents = await contentsRes.json();
        if (Array.isArray(contents)) {
          for (const item of contents) {
            fileTree.push(item.path);
          }

          // Pick 1-2 interesting source or config files to sample
          const interestingFiles = contents.filter(
            (c: any) =>
              c.type === 'file' &&
              (c.name.endsWith('.js') ||
                c.name.endsWith('.ts') ||
                c.name.endsWith('.py') ||
                c.name.endsWith('.json') ||
                c.name.endsWith('.yml') ||
                c.name.endsWith('.yaml') ||
                c.name.toLowerCase() === 'readme.md')
          );

          for (const file of interestingFiles.slice(0, 3)) {
            try {
              const fileRes = await fetch(
                `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`
              );
              if (fileRes.ok) {
                const content = await fileRes.text();
                sampleFiles.push({
                  path: file.path,
                  content: content.slice(0, 4000),
                });
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch contents:', e);
    }

    return {
      owner,
      repo,
      full_name: repoMeta.full_name || `${owner}/${repo}`,
      description: repoMeta.description || 'No description provided.',
      stars: repoMeta.stargazers_count || 0,
      forks: repoMeta.forks_count || 0,
      watchers: repoMeta.watchers_count || 0,
      open_issues: repoMeta.open_issues_count || 0,
      default_branch: defaultBranch,
      language: repoMeta.language || 'Multi-language',
      created_at: repoMeta.created_at || new Date().toISOString(),
      updated_at: repoMeta.updated_at || new Date().toISOString(),
      pushed_at: repoMeta.pushed_at || new Date().toISOString(),
      size: repoMeta.size || 0,
      license: repoMeta.license?.name,
      recent_commits: recentCommits,
      manifest_content: manifestData,
      sample_files: sampleFiles,
      file_tree: fileTree,
    };
  } catch (err) {
    console.error('Error fetching GitHub repository data:', err);
    return null;
  }
}
