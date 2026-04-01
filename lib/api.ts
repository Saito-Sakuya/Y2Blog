const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const fetchMenu = async () => {
  const res = await fetch(`${API_BASE}/menu`);
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json(); // { boards: [], pages: [] }
};

export const fetchBoards = async () => {
  const res = await fetch(`${API_BASE}/boards`);
  if (!res.ok) throw new Error('Failed to fetch boards');
  return res.json(); // { boards: [] }
};

export const fetchBoardContent = async (slug: string, queryParams?: URLSearchParams) => {
  const qs = queryParams ? `?${queryParams.toString()}` : '';
  const res = await fetch(`${API_BASE}/boards/${slug}${qs}`);
  if (!res.ok) throw new Error('Failed to fetch board content');
  return res.json(); // { board, items, pagination }
};

export const fetchPostContent = async (slug: string) => {
  const res = await fetch(`${API_BASE}/posts/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch post content');
  return res.json(); // { type, title, content, ... }
};

export const fetchSearch = async (query: string, limit = 20) => {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json(); // { query, results, total }
};

export const fetchAISummary = async (title: string, tags: string[]) => {
  const tagsParam = tags.join(',');
  const res = await fetch(`${API_BASE}/ai/summary?title=${encodeURIComponent(title)}&tags=${encodeURIComponent(tagsParam)}`);
  if (!res.ok && res.status !== 202) throw new Error('Failed to fetch AI summary');
  return res.json(); // { summary, status, ... }
};
export const fetchTags = async () => {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json(); // { tags: [{name: '', count: 1}], total: 9 }
};

export const fetchPreviewContent = async (token: string) => {
  const res = await fetch(`${API_BASE}/preview/${token}`);
  if (res.status === 401) {
    const data = await res.json();
    throw new Error(data.code === 'TOKEN_EXPIRED' ? 'EXPIRED' : 'INVALID');
  }
  if (!res.ok) throw new Error('Failed to fetch preview');
  return res.json();
};

export interface SiteConfig {
  siteTitle: string;
  siteDescription: string;
  siteLogoUrl: string;
  siteLicense: string;
  siteLicenseUrl: string;
  siteFooter: string;
  isSetup: boolean;
}

export const fetchSiteConfig = async (): Promise<SiteConfig> => {
  const res = await fetch(`${API_BASE}/site-config`);
  if (!res.ok) throw new Error('Failed to fetch site config');
  return res.json();
};
