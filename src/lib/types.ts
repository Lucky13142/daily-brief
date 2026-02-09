export interface HotItem {
    source: "weibo" | "baidu" | "hackernews" | "toutiao";
    title: string;
    url: string;
    hotScore: number;
}

export interface GeneratedCopy {
    summary: string;
    imagePrompt: string;
}

export interface Poster {
    id: string;
    source: string;
    title: string;
    summary: string;
    image_url: string;
    image_prompt: string | null;
    hot_rank: number | null;
    raw_data: Record<string, unknown> | null;
    created_at: string;
}
