// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContentItem {
  id: string;
  type: "video" | "image" | "idea";
  source: "youtube" | "pexels" | "reddit" | "newsdata" | "synthetic";
  title: string;
  description?: string;
  imageUrl?: string;
  viewCount?: string;
  url: string;
  hook?: string;
  author?: string;
  score?: number;
  /** True for AI-synthesized fallback cards — rendered with purple glow */
  synthetic?: boolean;
  /** Detected query intent, used for sorting/prioritisation */
  intent?: "video" | "image" | "brand";
}

export interface FeedResult {
  items: ContentItem[];
  query: string;
  intent: "video" | "image" | "brand" | "general";
  fetchedAt: string;
}

// ─── API Keys ─────────────────────────────────────────────────────────────────
// Keys are read from environment variables (set in .env.local for dev).
// For MVP quick-start the fallback values below are used when the env vars
// are not configured — move them to .env.local for production security.

const YOUTUBE_KEY =
  process.env.YOUTUBE_API_KEY ?? "AIzaSyA9N8hGOKRkgRLWT7OJcpOHltW9w2XpqdI";
const PEXELS_KEY =
  process.env.PEXELS_API_KEY ??
  "vAuNoWYrW8ZAn8TfBFPpoufPfu6ISIxslyK6hBGbMany6F4mPHRANHdH";
const NEWSDATA_KEY =
  process.env.NEWSDATA_API_KEY ?? "pub_69e0b3daf01c47ccb0c562d882e41424";

// ─── Intent Parser ────────────────────────────────────────────────────────────

type Intent = "video" | "image" | "brand" | "general";

const VIDEO_SIGNALS = ["reels", "shorts", "video", "reel", "tiktok", "clip"];
const IMAGE_SIGNALS = ["post", "posts", "photo", "photos", "aesthetic", "brand post", "visual"];
const BRAND_SIGNALS = ["brand", "brand news", "news", "shop", "company", "store", "product"];

export function parseIntent(query: string): Intent {
  const q = query.toLowerCase();
  if (VIDEO_SIGNALS.some((s) => q.includes(s))) return "video";
  if (IMAGE_SIGNALS.some((s) => q.includes(s))) return "image";
  if (BRAND_SIGNALS.some((s) => q.includes(s))) return "brand";
  return "general";
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

// ─── YouTube Shorts ───────────────────────────────────────────────────────────

async function fetchYouTube(
  query: string,
  prioritized = false,
): Promise<ContentItem[]> {
  const searchQuery = prioritized ? `${query} #shorts` : `${query} #shorts`;
  const maxResults = prioritized ? 8 : 5;

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", searchQuery);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoDuration", "short");
  searchUrl.searchParams.set("maxResults", String(maxResults));
  searchUrl.searchParams.set("order", "relevance");
  searchUrl.searchParams.set("key", YOUTUBE_KEY);

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

  // Batch-fetch view counts
  const videoIds = items.map((i) => i.id.videoId).join(",");
  const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  statsUrl.searchParams.set("part", "statistics");
  statsUrl.searchParams.set("id", videoIds);
  statsUrl.searchParams.set("key", YOUTUBE_KEY);

  const statsRes = await fetch(statsUrl.toString(), {
    next: { revalidate: 300 },
  });
  const statsData = statsRes.ok
    ? ((await statsRes.json()) as {
        items: Array<{ id: string; statistics: { viewCount?: string } }>;
      })
    : { items: [] as Array<{ id: string; statistics: { viewCount?: string } }> };

  const viewMap: Record<string, string> = {};
  for (const s of statsData.items ?? []) {
    viewMap[s.id] = fmtViews(parseInt(s.statistics?.viewCount ?? "0", 10));
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
    hook: `Viral Hook: "${item.snippet.title.slice(0, 60)}"`,
  }));
}

// ─── Pexels Images ────────────────────────────────────────────────────────────

async function fetchPexels(
  query: string,
  prioritized = false,
): Promise<ContentItem[]> {
  const perPage = prioritized ? 8 : 5;

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orientation", "portrait");

  const res = await fetch(url.toString(), {
    headers: { Authorization: PEXELS_KEY },
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
    title: photo.alt || `${query} aesthetic`,
    imageUrl: photo.src.large2x || photo.src.large,
    url: photo.url,
    author: photo.photographer,
    hook: `Content Concept: Use this ${query} visual for your next brand post.`,
  }));
}

// ─── NewsData ─────────────────────────────────────────────────────────────────

async function fetchNews(
  query: string,
  prioritized = false,
): Promise<ContentItem[]> {
  const url = new URL("https://newsdata.io/api/1/news");
  url.searchParams.set("apikey", NEWSDATA_KEY);
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
      source_id: string;
    }>;
  };

  const limit = prioritized ? 6 : 4;
  return (data.results ?? []).slice(0, limit).map((article) => ({
    id: `news-${article.article_id}`,
    type: "idea" as const,
    source: "newsdata" as const,
    title: article.title,
    description: article.description ?? undefined,
    imageUrl: article.image_url ?? undefined,
    url: article.link,
    author: article.source_id,
    hook: `Trend Alert: "${article.title.slice(0, 70)}" is the story everyone's watching.`,
  }));
}

// ─── Reddit Public API ────────────────────────────────────────────────────────

async function fetchReddit(
  query: string,
  prioritized = false,
): Promise<ContentItem[]> {
  const limit = prioritized ? 8 : 5;
  const url = `https://www.reddit.com/r/all/search.json?q=${encodeURIComponent(query)}&sort=hot&limit=${limit}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "TrendMatrixPro/1.0 (content research)" },
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
    author: `r/${child.data.subreddit}`,
    hook: `Community Angle: "${child.data.title.slice(0, 60)}" is going viral.`,
  }));
}

// ─── Synthetic Idea Generator ─────────────────────────────────────────────────

const VIRAL_FRAMEWORKS = [
  (q: string) => `3 Mistakes people make with ${q} (and how to fix them)`,
  (q: string) => `The secret ${q} strategy used by top 1% creators`,
  (q: string) => `POV: You just discovered the best ${q} hack in 2025`,
  (q: string) => `Why nobody talks about ${q} — the uncomfortable truth`,
  (q: string) =>
    `I tried ${q} every single day for 30 days. Here's what happened...`,
  (q: string) => `The ${q} trend that's about to dominate the next 12 months`,
  (q: string) => `Zero to ${q}: The beginner's blueprint nobody shares for free`,
  (q: string) => `What the ${q} industry doesn't want you to know`,
  (q: string) =>
    `${q} vs everything else — I tested them all. Real results inside.`,
  (q: string) =>
    `How I built a 6-figure brand around ${q} in 90 days (step-by-step)`,
];

const HOOK_STARTERS = [
  "This is the content idea your competitors are sleeping on:",
  "Stitch this. React to this. Go viral with this:",
  "Use this framework and watch your engagement explode:",
  "The hook that made 1M creators stop scrolling:",
  "Open loop hook — your audience can't ignore this:",
];

export function generateSyntheticIdeas(query: string): ContentItem[] {
  const q = query.trim() || "your niche";
  return VIRAL_FRAMEWORKS.map((fn, i) => ({
    id: `synth-${i}`,
    type: "idea" as const,
    source: "synthetic" as const,
    title: fn(q),
    url: "#",
    synthetic: true,
    hook: `${HOOK_STARTERS[i % HOOK_STARTERS.length]} "${fn(q).slice(0, 60)}…"`,
    author: "AI Trend Engine",
  }));
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export async function getTrendingContent(query: string): Promise<FeedResult> {
  const intent = parseIntent(query);

  // Fan out based on intent — prioritised sources fetch more results
  const [ytResult, pexResult, newsResult, redditResult] =
    await Promise.allSettled([
      fetchYouTube(query, intent === "video"),
      fetchPexels(query, intent === "image"),
      fetchNews(query, intent === "brand"),
      fetchReddit(query, intent === "brand"),
    ]);

  const youtube = ytResult.status === "fulfilled" ? ytResult.value : [];
  const pexels = pexResult.status === "fulfilled" ? pexResult.value : [];
  const news = newsResult.status === "fulfilled" ? newsResult.value : [];
  const reddit = redditResult.status === "fulfilled" ? redditResult.value : [];

  // Reorder source pools based on detected intent
  let pools: ContentItem[][];
  if (intent === "video") {
    pools = [youtube, pexels, news, reddit];
  } else if (intent === "image") {
    pools = [pexels, youtube, news, reddit];
  } else if (intent === "brand") {
    pools = [news, reddit, pexels, youtube];
  } else {
    pools = [youtube, pexels, news, reddit];
  }

  // Interleave for visual variety
  const interleaved: ContentItem[] = [];
  const maxLen = Math.max(...pools.map((p) => p.length));
  for (let i = 0; i < maxLen; i++) {
    for (const pool of pools) {
      if (pool[i]) interleaved.push(pool[i]);
    }
  }

  // Zero-Fail: if fewer than 5 real results, inject synthetic ideas
  const syntheticNeeded = interleaved.length < 5;
  const synthetic = syntheticNeeded ? generateSyntheticIdeas(query) : [];

  // Blend real + synthetic; synthetic go after the first few real results
  const items =
    interleaved.length === 0
      ? synthetic
      : [...interleaved.slice(0, 3), ...synthetic.slice(0, 4), ...interleaved.slice(3)];

  return {
    items,
    query,
    intent,
    fetchedAt: new Date().toISOString(),
  };
}
