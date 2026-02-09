import { HotItem } from "../types";

const BAIDU_API =
    "https://top.baidu.com/api/board?platform=wise&tab=realtime";

const AI_ECONOMY_KEYWORDS = [
    "ai", "AI", "人工智能", "大模型", "GPT", "gpt", "机器人", "智能",
    "深度学习", "算法", "芯片", "算力", "自动驾驶", "无人", "数据",
    "Claude", "OpenAI", "Gemini", "DeepSeek", "LLM", "AGI",
    "经济", "GDP", "股市", "A股", "美股", "港股", "基金", "房价",
    "利率", "通胀", "央行", "降息", "加息", "就业", "消费",
    "投资", "融资", "IPO", "上市", "科技", "半导体", "新能源",
];

const INVALID_TITLES = [
    "百度热搜", "热搜榜", "实时热点", "百度热榜", "今日热搜",
    "热门搜索", "搜索热点", "热搜排行",
];

function isValidTitle(title: string): boolean {
    if (!title || title.length < 4) return false;
    return !INVALID_TITLES.some((inv) => title.includes(inv));
}

function matchesKeywords(title: string): boolean {
    const lower = title.toLowerCase();
    return AI_ECONOMY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export async function fetchBaiduHotList(): Promise<HotItem[]> {
    try {
        const res = await fetch(BAIDU_API, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
            },
        });

        if (!res.ok) {
            throw new Error(`Baidu API responded with status ${res.status}`);
        }

        const data = await res.json();
        const list = data?.data?.cards?.[0]?.content;

        if (!list || list.length === 0) {
            throw new Error("Baidu API returned no data");
        }

        const filtered = list
            .filter((item: Record<string, unknown>) => {
                const title = String(item.word || item.query || item.desc || "");
                return isValidTitle(title) && matchesKeywords(title);
            })
            .slice(0, 10)
            .map(
                (item: Record<string, unknown>): HotItem => ({
                    source: "baidu",
                    title: String(item.word || item.query || item.desc || ""),
                    url: String(
                        item.url ||
                        `https://www.baidu.com/s?wd=${encodeURIComponent(
                            String(item.word || item.query || "")
                        )}`
                    ),
                    hotScore: Number(item.hotScore || 0),
                })
            );

        if (filtered.length === 0) {
            return list
                .filter((item: Record<string, unknown>) =>
                    isValidTitle(String(item.word || item.query || item.desc || ""))
                )
                .slice(0, 10).map(
                    (item: Record<string, unknown>): HotItem => ({
                        source: "baidu",
                        title: String(item.word || item.query || item.desc || ""),
                        url: String(
                            item.url ||
                            `https://www.baidu.com/s?wd=${encodeURIComponent(
                                String(item.word || item.query || "")
                            )}`
                        ),
                        hotScore: Number(item.hotScore || 0),
                    })
                );
        }

        return filtered;
    } catch (error) {
        console.error("Baidu API failed:", error);
        return fetchFromAggregator();
    }
}

async function fetchFromAggregator(): Promise<HotItem[]> {
    const res = await fetch("https://api.vvhan.com/api/hotlist/baiduRD", {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
    });

    if (!res.ok) {
        throw new Error(`Baidu aggregator API responded with status ${res.status}`);
    }

    const data = await res.json();

    if (!data?.success || !data?.data?.length) {
        throw new Error("Baidu aggregator returned no data");
    }

    const validData = data.data.filter((item: Record<string, unknown>) =>
        isValidTitle(String(item.title || ""))
    );

    const filtered = validData
        .filter((item: Record<string, unknown>) =>
            matchesKeywords(String(item.title || ""))
        )
        .slice(0, 10);

    const items = filtered.length > 0 ? filtered : validData.slice(0, 10);

    return items.map(
        (item: Record<string, unknown>): HotItem => ({
            source: "baidu",
            title: String(item.title || ""),
            url: String(item.url || item.mobilUrl || ""),
            hotScore: Number(item.hot || 0),
        })
    );
}
