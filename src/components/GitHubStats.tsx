import { useState, useEffect } from 'react';

interface RepoInfo {
  name: string;
  stars: number;
  version: string;
  issues: number;
}

const REPOS = [
  'Potassium',
  'Bananagine',
  'Bananasplit',
  'Peel',
  'BananAuth',
  'Bunch',
  'Hand',
  'Fiber',
];

const ORG = 'BananaLabs-OSS';

export default function GitHubStats() {
  const [stats, setStats] = useState<Record<string, RepoInfo>>({});

  useEffect(() => {
    async function fetchStats() {
      for (const repo of REPOS) {
        try {
          const res = await fetch(`https://api.github.com/repos/${ORG}/${repo}`);
          if (!res.ok) continue;
          const data = await res.json();

          let version = '';
          try {
            const tagRes = await fetch(`https://api.github.com/repos/${ORG}/${repo}/tags?per_page=1`);
            if (tagRes.ok) {
              const tags = await tagRes.json();
              if (tags.length > 0) version = tags[0].name;
            }
          } catch {}

          setStats(prev => ({
            ...prev,
            [repo]: {
              name: repo,
              stars: data.stargazers_count || 0,
              version,
              issues: data.open_issues_count || 0,
            },
          }));
        } catch {}
      }
    }

    fetchStats();
  }, []);

  return stats;
}

export function RepoTag({ repo }: { repo: string }) {
  const [info, setInfo] = useState<RepoInfo | null>(null);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`https://api.github.com/repos/${ORG}/${repo}`);
        if (!res.ok) return;
        const data = await res.json();

        let version = '';
        try {
          const tagRes = await fetch(`https://api.github.com/repos/${ORG}/${repo}/tags?per_page=1`);
          if (tagRes.ok) {
            const tags = await tagRes.json();
            if (tags.length > 0) version = tags[0].name;
          }
        } catch {}

        setInfo({
          name: repo,
          stars: data.stargazers_count || 0,
          version,
          issues: data.open_issues_count || 0,
        });
      } catch {}
    }

    fetch_();
  }, [repo]);

  if (!info) return null;

  const parts: string[] = [];
  if (info.version) parts.push(info.version);
  if (info.stars > 0) parts.push(`\u2B50 ${info.stars}`);

  if (parts.length === 0) return null;

  return (
    <span style={{
      fontSize: '11px',
      color: 'var(--dim)',
      fontWeight: 500,
      marginLeft: '8px',
    }}>
      {parts.join(' \u00B7 ')}
    </span>
  );
}

const LANG_CLASSES: Record<string, string> = {
  Go: 'eco-tag-go',
  Java: 'eco-tag-go',
  TypeScript: 'eco-tag-go',
  JavaScript: 'eco-tag-go',
  Rust: 'eco-tag-go',
  Python: 'eco-tag-go',
};

export function RepoLang({ repo }: { repo: string }) {
  const [lang, setLang] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLang() {
      try {
        const res = await fetch(`https://api.github.com/repos/${ORG}/${repo}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.language) setLang(data.language);
      } catch {}
    }
    fetchLang();
  }, [repo]);

  if (!lang) return null;

  return (
    <span className={`eco-tag ${LANG_CLASSES[lang] || 'eco-tag-go'}`}>
      {lang}
    </span>
  );
}
