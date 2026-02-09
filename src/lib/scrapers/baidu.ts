import * as cheerio from "cheerio";
import { HotItem } from "../types";

const BAIDU_HOT_API = "https://top.baidu.com/board?tab=realtime";

export async function fetchBaiduHot(): Promise<HotItem> {
    try {
        const res = await fetch(BAIDU_HOT_API, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
        });

        if (!res.ok) {
            throw new Error(`Baidu API responded with status ${res.status}`);
        }

        const html = await res.text();

        // 从页面中提取 SSR 数据
        const dataMatch = html.match(/<!--s-data:([\s\S]*?)-->/);
        if (dataMatch) {
            const ssrData = JSON.parse(dataMatch[1]);
            const cards = ssrData?.data?.cards;

            if (cards && cards.length > 0) {
                const firstCard = cards[0];
                const content = firstCard?.content;

                if (content && content.length > 0) {
                    const top = content[0];
                    return {
                        source: "baidu",
                        title: top.word || top.query,
                        url: top.url || `https://www.baidu.com/s?wd=${encodeURIComponent(top.word || top.query)}`,
                        hotScore: top.hotScore || 0,
                    };
                }
            }
        }

        // 降级：直接用 cheerio 解析
        const $ = cheerio.load(html);
        const firstTitle = $(".c-single-text-ellipsis").first().text().trim();

        if (!firstTitle) {
            throw new Error("Failed to parse Baidu hot search");
        }

        return {
            source: "baidu",
            title: firstTitle,
            url: `https://www.baidu.com/s?wd=${encodeURIComponent(firstTitle)}`,
            hotScore: 0,
        };
    } catch (error) {
        console.error("Failed to fetch Baidu hot search:", error);
        // 最终降级：使用百度搜索建议 API
        return fetchBaiduHotFallback();
    }
}

async function fetchBaiduHotFallback(): Promise<HotItem> {
    const res = await fetch(
        "https://top.baidu.com/api/board?platform=wise&tab=realtime",
        {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
            },
        }
    );

    const data = await res.json();
    const list = data?.data?.cards?.[0]?.content;

    if (!list || list.length === 0) {
        throw new Error("Baidu fallback API returned no data");
    }

    const top = list[0];
    return {
        source: "baidu",
        title: top.word || top.query || top.desc,
        url: top.url || `https://www.baidu.com/s?wd=${encodeURIComponent(top.word || top.query)}`,
        hotScore: top.hotScore || 0,
    };
}
