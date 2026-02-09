import { HotItem } from "../types";

// 今日头条热榜 API（ByteDance 产品，海外可访问）
const TOUTIAO_HOT_URL =
  "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc";

export async function fetchWeiboHot(): Promise<HotItem> {
  // 优先使用今日头条热榜（海外服务器可访问）
  try {
    const res = await fetch(TOUTIAO_HOT_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new Error(`Toutiao API responded with status ${res.status}`);
    }

    const data = await res.json();
    const list = data?.data;

    if (!list || list.length === 0) {
      throw new Error("No Toutiao hot data found");
    }

    const top = list[0];
    return {
      source: "toutiao",
      title: top.Title || top.title,
      url: top.Url || top.url || `https://www.toutiao.com/trending/${top.ClusterIdStr || ""}`,
      hotScore: top.HotValue || 0,
    };
  } catch (error) {
    console.error("Toutiao API failed:", error);
    // 降级：使用第三方聚合 API
    return fetchFromAggregator();
  }
}

async function fetchFromAggregator(): Promise<HotItem> {
  const res = await fetch("https://api.vvhan.com/api/hotlist/wbHot", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Aggregator API responded with status ${res.status}`);
  }

  const data = await res.json();

  if (!data?.success || !data?.data?.length) {
    throw new Error("Aggregator returned no data");
  }

  const top = data.data[0];
  return {
    source: "toutiao",
    title: top.title,
    url: top.url || top.mobilUrl || "",
    hotScore: top.hot || 0,
  };
}
