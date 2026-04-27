import type { NicheCategory, TrendItem } from "@/lib/types";

function hooks(title: string): [string, string, string] {
  return [
    `The secret to "${title}" that 99% of creators never share`,
    `I tried "${title}" for 30 days — here's the uncomfortable truth`,
    `Why everything you know about "${title}" is completely wrong`,
  ];
}

const YOUTUBE_MOCKS: TrendItem[] = [
  {
    id: "yt-mock-1",
    source: "youtube",
    title: "I Lived on $1 a Day for 30 Days (Honest Results)",
    imageUrl: "https://picsum.photos/seed/yt1/400/711",
    viewCount: "4.2M",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    niche: "lifestyle",
    aiHooks: hooks("Living on $1 a Day"),
  },
  {
    id: "yt-mock-2",
    source: "youtube",
    title: "5 AI Tools Replacing Entire Teams in 2025",
    imageUrl: "https://picsum.photos/seed/yt2/400/711",
    viewCount: "8.7M",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    niche: "tech",
    aiHooks: hooks("AI Tools Replacing Teams"),
  },
  {
    id: "yt-mock-3",
    source: "youtube",
    title: "The Workout That Changed My Body in 6 Weeks",
    imageUrl: "https://picsum.photos/seed/yt3/400/711",
    viewCount: "2.1M",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    niche: "fitness",
    aiHooks: hooks("6-Week Body Transformation"),
  },
  {
    id: "yt-mock-4",
    source: "youtube",
    title: "How I Made $12,000 Dropshipping in 1 Month",
    imageUrl: "https://picsum.photos/seed/yt4/400/711",
    viewCount: "6.3M",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    niche: "business",
    aiHooks: hooks("$12K Dropshipping Month"),
  },
  {
    id: "yt-mock-5",
    source: "youtube",
    title: "Skincare Routine That Cleared My Acne in 2 Weeks",
    imageUrl: "https://picsum.photos/seed/yt5/400/711",
    viewCount: "3.8M",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    niche: "beauty",
    aiHooks: hooks("Acne-Clearing Skincare"),
  },
  {
    id: "yt-mock-6",
    source: "youtube",
    title: "This Gaming Setup Cost Less Than Your Phone",
    imageUrl: "https://picsum.photos/seed/yt6/400/711",
    viewCount: "1.9M",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    niche: "gaming",
    aiHooks: hooks("Budget Gaming Setup"),
  },
];

const PINTEREST_MOCKS: TrendItem[] = [
  {
    id: "pin-mock-1",
    source: "pinterest",
    title: "Minimalist Home Office Aesthetic 2025",
    imageUrl: "https://picsum.photos/seed/pin1/600/800",
    url: "https://pinterest.com",
    niche: "lifestyle",
    aiHooks: hooks("Minimalist Home Office"),
  },
  {
    id: "pin-mock-2",
    source: "pinterest",
    title: "Sustainable Fashion Capsule Wardrobe",
    imageUrl: "https://picsum.photos/seed/pin2/600/900",
    url: "https://pinterest.com",
    niche: "lifestyle",
    aiHooks: hooks("Sustainable Capsule Wardrobe"),
  },
  {
    id: "pin-mock-3",
    source: "pinterest",
    title: "Futuristic UI Design Inspiration",
    imageUrl: "https://picsum.photos/seed/pin3/600/700",
    url: "https://pinterest.com",
    niche: "tech",
    aiHooks: hooks("Futuristic UI Design"),
  },
  {
    id: "pin-mock-4",
    source: "pinterest",
    title: "Clean Eating Meal Prep Ideas",
    imageUrl: "https://picsum.photos/seed/pin4/600/850",
    url: "https://pinterest.com",
    niche: "fitness",
    aiHooks: hooks("Meal Prep"),
  },
  {
    id: "pin-mock-5",
    source: "pinterest",
    title: "Dark Academia Room Decor",
    imageUrl: "https://picsum.photos/seed/pin5/600/780",
    url: "https://pinterest.com",
    niche: "lifestyle",
    aiHooks: hooks("Dark Academia Aesthetic"),
  },
  {
    id: "pin-mock-6",
    source: "pinterest",
    title: "Glass Skin Korean Beauty Routine",
    imageUrl: "https://picsum.photos/seed/pin6/600/820",
    url: "https://pinterest.com",
    niche: "beauty",
    aiHooks: hooks("Glass Skin Routine"),
  },
];

const REDDIT_MOCKS: TrendItem[] = [
  {
    id: "reddit-mock-1",
    source: "reddit",
    title:
      "What's a productivity hack that actually changed your life? (Not the obvious ones)",
    url: "https://reddit.com/r/productivity",
    niche: "business",
    aiHooks: hooks("Life-Changing Productivity Hacks"),
  },
  {
    id: "reddit-mock-2",
    source: "reddit",
    title:
      "Gen Z is rejecting hustle culture — and the data proves they're right",
    url: "https://reddit.com/r/antiwork",
    niche: "lifestyle",
    aiHooks: hooks("Gen Z Rejecting Hustle Culture"),
  },
  {
    id: "reddit-mock-3",
    source: "reddit",
    title: "What's the most underrated programming language in 2025?",
    url: "https://reddit.com/r/programming",
    niche: "tech",
    aiHooks: hooks("Underrated Programming Languages"),
  },
  {
    id: "reddit-mock-4",
    source: "reddit",
    title:
      "I've trained 500+ people — here's the one thing beginners get wrong about muscle growth",
    url: "https://reddit.com/r/fitness",
    niche: "fitness",
    aiHooks: hooks("Muscle Growth Mistakes"),
  },
  {
    id: "reddit-mock-5",
    source: "reddit",
    title: "The skincare ingredient your dermatologist doesn't tell you about",
    url: "https://reddit.com/r/SkincareAddiction",
    niche: "beauty",
    aiHooks: hooks("Secret Skincare Ingredient"),
  },
  {
    id: "reddit-mock-6",
    source: "reddit",
    title:
      "Game devs are burning out en masse — the industry has a serious problem",
    url: "https://reddit.com/r/gamedev",
    niche: "gaming",
    aiHooks: hooks("Game Dev Burnout Crisis"),
  },
  {
    id: "reddit-mock-7",
    source: "reddit",
    title:
      "What nobody tells you about starting a business with less than $1,000",
    url: "https://reddit.com/r/entrepreneur",
    niche: "business",
    aiHooks: hooks("Starting a Business Under $1000"),
  },
  {
    id: "reddit-mock-8",
    source: "reddit",
    title:
      "AI replaced my entire design workflow — here's what actually happened",
    url: "https://reddit.com/r/artificial",
    niche: "tech",
    aiHooks: hooks("AI Replacing Design Workflow"),
  },
];

const NICHE_SUBREDDITS: Record<string, string[]> = {
  tech: ["tech", "artificial"],
  fitness: ["fitness"],
  business: ["business", "entrepreneur"],
  lifestyle: ["lifestyle"],
  beauty: ["beauty"],
  gaming: ["gaming"],
  all: [
    "lifestyle",
    "tech",
    "fitness",
    "business",
    "lifestyle",
    "beauty",
    "gaming",
  ],
};

export function getMockData(query: string, niche: NicheCategory): TrendItem[] {
  const nicheSet = new Set(NICHE_SUBREDDITS[niche] ?? []);

  const filterByNiche = (items: TrendItem[]) => {
    if (niche === "all") return items;
    return items.filter((item) => nicheSet.has(item.niche));
  };

  const queryLower = query.toLowerCase();

  const matchQuery = (item: TrendItem) => {
    const combined = (item.title + " " + item.niche).toLowerCase();
    return queryLower === "" || queryLower === "trending"
      ? true
      : combined.includes(queryLower);
  };

  const youtube = filterByNiche(YOUTUBE_MOCKS).filter(matchQuery);
  const pinterest = filterByNiche(PINTEREST_MOCKS).filter(matchQuery);
  const reddit = filterByNiche(REDDIT_MOCKS).filter(matchQuery);

  // If query produces no results, return all items mixed across sources
  const combined = [...youtube, ...pinterest, ...reddit];
  if (combined.length === 0) {
    return shuffle([...YOUTUBE_MOCKS, ...PINTEREST_MOCKS, ...REDDIT_MOCKS]);
  }

  return shuffle(combined);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
