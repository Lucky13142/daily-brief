export interface HotItem {
    source: "toutiao" | "baidu";
    title: string;
    url: string;
    hotScore: number;
}

export interface GeneratedNewsItem {
    title: string;
    summary: string;
    tags: string[];
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
