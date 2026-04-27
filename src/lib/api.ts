// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContentItem {
  id: string;
  type: "video" | "image" | "idea";
  source: "youtube" | "pexels" | "reddit" | "newsdata";
  title: string;
  description?: string;
  imageUrl?: string;
  viewCount?: string;
  url: string;
  hook?: string;
  author?: string;
  score?: number;
}

export interface FeedResult {
  items: ContentItem[];
  query: string;
  fetchedAt: string;
}

// ─── Env vars (server-side only) ──────────────────────────────────────────────

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

function buildHook(title: string, query: string): string {
  const t = title.length > 55 ? title.slice(0, 55) + "…" : title;
  return `Hook: Why "${t}" is the ${query} story blowing up right now`;
}

// ─── YouTube Shorts ───────────────────────────────────────────────────────────

async function fetchYouTube(query: string): Promise<ContentItem[]> {
  if (!YOUTUBE_API_KEY) return [];

  // Search for Shorts
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", `${query} #shorts`);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoDuration", "short");
  searchUrl.searchParams.set("maxResults", "6");
  searchUrl.searchParams.set("order", "relevance");
  searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

  const searchRes = await fetch(searchUrl.toString(), {
    next: { revalidate: 300 },
  });
  if (!searchRes.ok) return [];

  const searchData = (await searchRes.json()) as {
    items: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        description: string;
        thumbnails: { high?: { url: string }; medium?: { url: string } };
      };
    }>;
  };

  const items = searchData.items ?? [];
  if (items.length === 0) return [];

  // Fetch view counts in a single batch call
  const videoIds = items.map((i) => i.id.videoId).join(",");
  const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  statsUrl.searchParams.set("part", "statistics");
  statsUrl.searchParams.set("id", videoIds);
  statsUrl.searchParams.set("key", YOUTUBE_API_KEY);

  const statsRes = await fetch(statsUrl.toString(), {
    next: { revalidate: 300 },
  });
  const statsData = statsRes.ok
    ? ((await statsRes.json()) as {
        items: Array<{ id: string; statistics: { viewCount?: string } }>;
      })
    : { items: [] };

  const viewMap: Record<string, string> = {};
  for (const stat of statsData.items ?? []) {
    viewMap[stat.id] = formatViews(
      parseInt(stat.statistics?.viewCount ?? "0", 10),
    );
  }

  return items.map((item) => ({
    id: `yt-${item.id.videoId}`,
    type: "video" as const,
    source: "youtube" as const,
    title: item.snippet.title,
    description: item.snippet.description,
    imageUrl:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      undefined,
    viewCount: viewMap[item.id.videoId],
    url: `https://www.youtube.com/shorts/${item.id.videoId}`,
  }));
}

// ─── Pexels Images ────────────────────────────────────────────────────────────

async function fetchPexels(query: string): Promise<ContentItem[]> {
  if (!PEXELS_API_KEY) return [];

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "6");
  url.searchParams.set("orientation", "portrait");

  const res = await fetch(url.toString(), {
    headers: { Authorization: PEXELS_API_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    photos: Array<{
      id: number;
      alt: string;
      src: { large2x: string; large: string };
      url: string;
      photographer: string;
    }>;
  };

  return (data.photos ?? []).map((photo) => ({
    id: `pex-${photo.id}`,
    type: "image" as const,
    source: "pexels" as const,
    title: photo.alt || `${query} aesthetics`,
    imageUrl: photo.src.large2x || photo.src.large,
    url: photo.url,
    author: photo.photographer,
  }));
}

// ─── NewsData.io ──────────────────────────────────────────────────────────────

async function fetchNews(query: string): Promise<ContentItem[]> {
  if (!NEWSDATA_API_KEY) return [];

  const url = new URL("https://newsdata.io/api/1/news");
  url.searchParams.set("apikey", NEWSDATA_API_KEY);
  url.searchParams.set("q", query);
  url.searchParams.set("category", "top");
  url.searchParams.set("language", "en");

  const res = await fetch(url.toString(), { next: { revalidate: 600 } });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    results: Array<{
      article_id: string;
      title: string;
      description: string | null;
      image_url: string | null;
      link: string;
    }>;
  };

  return (data.results ?? []).slice(0, 5).map((article) => ({
    id: `news-${article.article_id}`,
    type: "idea" as const,
    source: "newsdata" as const,
    title: article.title,
    description: article.description ?? undefined,
    imageUrl: article.image_url ?? undefined,
    url: article.link,
    hook: buildHook(article.title, query),
  }));
}

// ─── Reddit Public API ────────────────────────────────────────────────────────

async function fetchReddit(query: string): Promise<ContentItem[]> {
  const url = `https://www.reddit.com/r/all/search.json?q=${encodeURIComponent(query)}&sort=hot&limit=6`;

  const res = await fetch(url, {
    headers: { "User-Agent": "TrendMatrix/1.0 (content research)" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    data: {
      children: Array<{
        data: {
          id: string;
          title: string;
          selftext: string;
          permalink: string;
          ups: number;
          subreddit: string;
        };
      }>;
    };
  };

  return (data.data?.children ?? []).map((child) => ({
    id: `reddit-${child.data.id}`,
    type: "idea" as const,
    source: "reddit" as const,
    title: child.data.title,
    description: child.data.selftext?.slice(0, 200) || undefined,
    url: `https://www.reddit.com${child.data.permalink}`,
    score: child.data.ups,
    hook: buildHook(child.data.title, query),
    author: `r/${child.data.subreddit}`,
  }));
}

// ─── Mock Fallback ────────────────────────────────────────────────────────────

function getMockContent(query: string): ContentItem[] {
  return [
    {
      id: "m-yt-1",
      type: "video",
      source: "youtube",
      title: `The ${query} Secret Going Viral on Shorts`,
      imageUrl: "https://picsum.photos/seed/yt-a/400/711",
      viewCount: "4.2M",
      url: "#",
    },
    {
      id: "m-pex-1",
      type: "image",
      source: "pexels",
      title: `${query} Aesthetic`,
      imageUrl: "https://picsum.photos/seed/px-a/600/900",
      url: "#",
      author: "Jane Doe",
    },
    {
      id: "m-news-1",
      type: "idea",
      source: "newsdata",
      title: `The ${query} Revolution: What Experts Won't Tell You`,
      url: "#",
      hook: `Hook: Why the ${query} space is about to explode in 2025`,
    },
    {
      id: "m-reddit-1",
      type: "idea",
      source: "reddit",
      title: `I spent 6 months studying ${query} — here's the uncomfortable truth`,
      url: "#",
      hook: `Hook: The ${query} secret top creators hide from their audience`,
      author: "r/entrepreneur",
      score: 24500,
    },
    {
      id: "m-yt-2",
      type: "video",
      source: "youtube",
      title: `${query} Changed My Life in 30 Days (Honest Review)`,
      imageUrl: "https://picsum.photos/seed/yt-b/400/711",
      viewCount: "8.7M",
      url: "#",
    },
    {
      id: "m-pex-2",
      type: "image",
      source: "pexels",
      title: `${query} Vibes 2025`,
      imageUrl: "https://picsum.photos/seed/px-b/600/800",
      url: "#",
      author: "Alex Smith",
    },
    {
      id: "m-reddit-2",
      type: "idea",
      source: "reddit",
      title: `Why everyone is suddenly obsessed with ${query} (data inside)`,
      url: "#",
      hook: `Hook: The ${query} trend no one is talking about yet`,
      score: 18200,
      author: "r/trends",
    },
    {
      id: "m-pex-3",
      type: "image",
      source: "pexels",
      title: `${query} Inspiration Board`,
      imageUrl: "https://picsum.photos/seed/px-c/600/1000",
      url: "#",
      author: "Mike Chen",
    },
    {
      id: "m-yt-3",
      type: "video",
      source: "youtube",
      title: `5 ${query} Tips That Made Me $10K Last Month`,
      imageUrl: "https://picsum.photos/seed/yt-c/400/711",
      viewCount: "2.1M",
      url: "#",
    },
    {
      id: "m-news-2",
      type: "idea",
      source: "newsdata",
      title: `Breaking: ${query} Market Shifts Overnight`,
      url: "#",
      hook: `Hook: This ${query} trend is the fastest-growing content vertical of 2025`,
    },
  ];
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function getTrendingContent(query: string): Promise<ContentItem[]> {
  const hasKeys = !!(YOUTUBE_API_KEY || PEXELS_API_KEY || NEWSDATA_API_KEY);

  if (!hasKeys) {
    return getMockContent(query);
  }

  const [ytResult, pexResult, newsResult, redditResult] =
    await Promise.allSettled([
      fetchYouTube(query),
      fetchPexels(query),
      fetchNews(query),
      fetchReddit(query),
    ]);

  const youtube = ytResult.status === "fulfilled" ? ytResult.value : [];
  const pexels = pexResult.status === "fulfilled" ? pexResult.value : [];
  const news = newsResult.status === "fulfilled" ? newsResult.value : [];
  const reddit = redditResult.status === "fulfilled" ? redditResult.value : [];

  // Interleave for feed variety: yt → pexels → news → reddit
  const interleaved: ContentItem[] = [];
  const maxLen = Math.max(
    youtube.length,
    pexels.length,
    news.length,
    reddit.length,
  );
  for (let i = 0; i < maxLen; i++) {
    if (youtube[i]) interleaved.push(youtube[i]);
    if (pexels[i]) interleaved.push(pexels[i]);
    if (news[i]) interleaved.push(news[i]);
    if (reddit[i]) interleaved.push(reddit[i]);
  }

  return interleaved.length > 0 ? interleaved : getMockContent(query);
}
