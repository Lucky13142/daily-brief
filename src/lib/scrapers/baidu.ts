import { HotItem } from "../types";

// 百度热搜 API（移动端接口，海外相对可访问）
const BAIDU_API =
    "https://top.baidu.com/api/board?platform=wise&tab=realtime";

export async function fetchBaiduHot(): Promise<HotItem> {
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

        const top = list[0];
        return {
            source: "baidu",
            title: top.word || top.query || top.desc,
            url:
                top.url ||
                `https://www.baidu.com/s?wd=${encodeURIComponent(top.word || top.query)}`,
            hotScore: top.hotScore || 0,
        };
    } catch (error) {
        console.error("Baidu API failed:", error);
        // 降级：使用第三方聚合 API
        return fetchFromAggregator();
    }
}

async function fetchFromAggregator(): Promise<HotItem> {
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

    const top = data.data[0];
    return {
        source: "baidu",
        title: top.title,
        url: top.url || top.mobilUrl || "",
        hotScore: top.hot || 0,
    };
}
