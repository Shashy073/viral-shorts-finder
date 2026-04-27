export type TrendSource = "youtube" | "pinterest" | "reddit";

export type NicheCategory =
  | "all"
  | "tech"
  | "fitness"
  | "business"
  | "lifestyle"
  | "beauty"
  | "gaming";

export interface TrendItem {
  id: string;
  source: TrendSource;
  title: string;
  description?: string;
  imageUrl?: string;
  viewCount?: string;
  url: string;
  niche: string;
  aiHooks: [string, string, string];
}

export interface FetchAllTrendsResult {
  items: TrendItem[];
  query: string;
  niche: string;
  fetchedAt: string;
}
