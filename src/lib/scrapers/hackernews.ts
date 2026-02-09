import { HotItem } from "../types";

const HN_TOP_STORIES_URL =
    "https://hacker-news.firebaseio.com/v0/topstories.json";
const HN_ITEM_URL = "https://hacker-news.firebaseio.com/v0/item";

interface HNItem {
    id: number;
    title: string;
    url?: string;
    score: number;
    by: string;
    type: string;
}

export async function fetchHackerNewsHot(): Promise<HotItem> {
    const res = await fetch(HN_TOP_STORIES_URL);

    if (!res.ok) {
        throw new Error(`HackerNews API responded with status ${res.status}`);
    }

    const storyIds: number[] = await res.json();

    if (!storyIds || storyIds.length === 0) {
        throw new Error("No HackerNews stories found");
    }

    // 获取 Top 1 故事详情
    const topId = storyIds[0];
    const itemRes = await fetch(`${HN_ITEM_URL}/${topId}.json`);

    if (!itemRes.ok) {
        throw new Error(`Failed to fetch HN item ${topId}`);
    }

    const item: HNItem = await itemRes.json();

    return {
        source: "hackernews",
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        hotScore: item.score || 0,
    };
}
