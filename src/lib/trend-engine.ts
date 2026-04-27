import { getMockData } from "@/lib/mock-data";
import type { FetchAllTrendsResult, NicheCategory, TrendItem } from "@/lib/types";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

const NICHE_SUBREDDIT: Record<NicheCategory, string> = {
  all: "all",
  tech: "technology",
  fitness: "fitness",
  business: "entrepreneur",
  lifestyle: "lifestyle",
  beauty: "SkincareAddiction",
  gaming: "gaming",
};

function buildAIHooks(title: string): [string, string, string] {
  const t = title.length > 45 ? title.slice(0, 45) + "…" : title;
  return [
    `The secret to "${t}" that nobody talks about`,
    `I tried "${t}" for 30 days — here's what actually happened`,
    `Why 99% of people get "${t}" completely wrong`,
  ];
}

async function fetchYouTubeShorts(query: string): Promise<TrendItem[]> {
  if (!YOUTUBE_API_KEY) return [];

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("videoDuration", "short");
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("key", YOUTUBE_API_KEY);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    items: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        description: string;
        thumbnails: { high?: { url: string }; medium?: { url: string } };
      };
    }>;
  };

  return (data.items ?? []).map((item) => ({
    id: `yt-${item.id.videoId}`,
    source: "youtube" as const,
    title: item.snippet.title,
    description: item.snippet.description,
    imageUrl:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      undefined,
    viewCount: undefined,
    url: `https://www.youtube.com/shorts/${item.id.videoId}`,
    niche: query,
    aiHooks: buildAIHooks(item.snippet.title),
  }));
}

async function fetchPinterestTrends(query: string): Promise<TrendItem[]> {
  if (!PINTEREST_ACCESS_TOKEN) return [];

  const url = new URL("https://api.pinterest.com/v5/pins");
  url.searchParams.set("query", query);
  url.searchParams.set("page_size", "8");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${PINTEREST_ACCESS_TOKEN}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    items: Array<{
      id: string;
      title: string;
      description: string;
      media?: {
        images?: {
          "600x"?: { url: string };
          "400x400"?: { url: string };
        };
      };
    }>;
  };

  return (data.items ?? []).map((pin) => ({
    id: `pin-${pin.id}`,
    source: "pinterest" as const,
    title: pin.title ?? "Trending Pin",
    description: pin.description,
    imageUrl:
      pin.media?.images?.["600x"]?.url ??
      pin.media?.images?.["400x400"]?.url ??
      undefined,
    url: `https://www.pinterest.com/pin/${pin.id}`,
    niche: query,
    aiHooks: buildAIHooks(pin.title ?? "Trending Pin"),
  }));
}

async function fetchRedditTopics(
  query: string,
  niche: NicheCategory,
): Promise<TrendItem[]> {
  const subreddit = NICHE_SUBREDDIT[niche] ?? "all";
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=hot&limit=8&restrict_sr=0`;

  const res = await fetch(url, {
    headers: { "User-Agent": "TrendMatrix/1.0 (content research tool)" },
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
        };
      }>;
    };
  };

  return (data.data?.children ?? []).map((child) => ({
    id: `reddit-${child.data.id}`,
    source: "reddit" as const,
    title: child.data.title,
    description: child.data.selftext?.slice(0, 220) || undefined,
    url: `https://www.reddit.com${child.data.permalink}`,
    niche: query,
    aiHooks: buildAIHooks(child.data.title),
  }));
}

async function fetchNewsData(query: string): Promise<TrendItem[]> {
  if (!NEWSDATA_API_KEY) return [];

  const url = new URL("https://newsdata.io/api/1/news");
  url.searchParams.set("apikey", NEWSDATA_API_KEY);
  url.searchParams.set("q", query);
  url.searchParams.set("language", "en");
  url.searchParams.set("category", "technology,entertainment,business");

  const res = await fetch(url.toString(), { next: { revalidate: 600 } });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    results: Array<{
      article_id: string;
      title: string;
      description: string;
      image_url: string | null;
      link: string;
    }>;
  };

  return (data.results ?? []).slice(0, 4).map((article) => ({
    id: `news-${article.article_id}`,
    source: "reddit" as const, // displayed as "Idea" card
    title: article.title,
    description: article.description,
    imageUrl: article.image_url ?? undefined,
    url: article.link,
    niche: query,
    aiHooks: buildAIHooks(article.title),
  }));
}

export async function fetchAllTrends(
  query: string,
  niche: NicheCategory = "all",
): Promise<FetchAllTrendsResult> {
  const hasAnyKey =
    !!YOUTUBE_API_KEY || !!PINTEREST_ACCESS_TOKEN || !!NEWSDATA_API_KEY;

  if (!hasAnyKey) {
    return {
      items: getMockData(query, niche),
      query,
      niche,
      fetchedAt: new Date().toISOString(),
    };
  }

  const [ytResult, pinResult, redditResult, newsResult] =
    await Promise.allSettled([
      fetchYouTubeShorts(query),
      fetchPinterestTrends(query),
      fetchRedditTopics(query, niche),
      fetchNewsData(query),
    ]);

  const liveItems: TrendItem[] = [
    ...(ytResult.status === "fulfilled" ? ytResult.value : []),
    ...(pinResult.status === "fulfilled" ? pinResult.value : []),
    ...(redditResult.status === "fulfilled" ? redditResult.value : []),
    ...(newsResult.status === "fulfilled" ? newsResult.value : []),
  ];

  // Supplement with mock data when live sources return nothing
  const items =
    liveItems.length > 0 ? liveItems : getMockData(query, niche);

  return {
    items,
    query,
    niche,
    fetchedAt: new Date().toISOString(),
  };
}
