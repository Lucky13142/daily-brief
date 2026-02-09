import * as cheerio from "cheerio";
import { HotItem } from "../types";

const WEIBO_HOT_URL = "https://weibo.com/ajax/side/hotSearch";

export async function fetchWeiboHot(): Promise<HotItem> {
    try {
        const res = await fetch(WEIBO_HOT_URL, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "application/json, text/plain, */*",
            },
        });

        if (!res.ok) {
            throw new Error(`Weibo API responded with status ${res.status}`);
        }

        const data = await res.json();
        const realtime = data?.data?.realtime;

        if (!realtime || realtime.length === 0) {
            throw new Error("No Weibo hot search data found");
        }

        // 取第一条非广告热搜
        const top = realtime.find(
            (item: Record<string, unknown>) => !item.is_ad
        ) || realtime[0];

        return {
            source: "weibo",
            title: top.word || top.note,
            url: `https://s.weibo.com/weibo?q=%23${encodeURIComponent(top.word || top.note)}%23`,
            hotScore: top.num || top.raw_hot || 0,
        };
    } catch (error) {
        console.error("Failed to fetch Weibo hot search:", error);
        // 降级：使用页面抓取
        return fetchWeiboHotFallback();
    }
}

async function fetchWeiboHotFallback(): Promise<HotItem> {
    const res = await fetch("https://s.weibo.com/top/summary", {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Cookie: "SUB=_2AkMWJrkzf8NxqwFRmP8SymnhaY10ywzEieKnR-8xJRMxHRl-yT9kqlcYtRB6PaaacIGa7ZWQBp51VEv1CB6OSLnXsEYB",
        },
    });

    const html = await res.text();
    const $ = cheerio.load(html);
    const firstItem = $("td.td-02 a").first();

    const title = firstItem.text().trim();
    const href = firstItem.attr("href") || "";

    if (!title) {
        throw new Error("Failed to parse Weibo hot search from HTML");
    }

    return {
        source: "weibo",
        title,
        url: href.startsWith("http") ? href : `https://s.weibo.com${href}`,
        hotScore: 0,
    };
}
