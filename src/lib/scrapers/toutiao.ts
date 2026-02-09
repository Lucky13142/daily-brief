import { HotItem } from "../types";

const TOUTIAO_HOT_URL =
  "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc";

const AI_ECONOMY_KEYWORDS = [
  "ai", "AI", "人工智能", "大模型", "GPT", "gpt", "机器人", "智能",
  "深度学习", "算法", "芯片", "算力", "自动驾驶", "无人", "数据",
  "Claude", "OpenAI", "Gemini", "DeepSeek", "LLM", "AGI",
  "经济", "GDP", "股市", "A股", "美股", "港股", "基金", "房价",
  "利率", "通胀", "央行", "降息", "加息", "就业", "消费",
  "投资", "融资", "IPO", "上市", "科技", "半导体", "新能源",
];

const INVALID_TITLES = [
  "今日热榜", "热榜", "热搜榜", "头条热榜", "今日头条",
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

export async function fetchToutiaoHotList(): Promise<HotItem[]> {
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

    const filtered = list
      .filter((item: Record<string, unknown>) => {
        const title = String(item.Title || item.title || "");
        return isValidTitle(title) && matchesKeywords(title);
      })
      .slice(0, 10)
      .map((item: Record<string, unknown>, index: number): HotItem => ({
        source: "toutiao",
        title: String(item.Title || item.title || ""),
        url: String(
          item.Url ||
          item.url ||
          `https://www.toutiao.com/trending/${item.ClusterIdStr || ""}`
        ),
        hotScore: Number(item.HotValue || 0),
      }));

    if (filtered.length === 0) {
      // 关键词没匹配到，取前 10 条有效条目
      return list
        .filter((item: Record<string, unknown>) =>
          isValidTitle(String(item.Title || item.title || ""))
        )
        .slice(0, 10).map(
          (item: Record<string, unknown>): HotItem => ({
            source: "toutiao",
            title: String(item.Title || item.title || ""),
            url: String(
              item.Url ||
              item.url ||
              `https://www.toutiao.com/trending/${item.ClusterIdStr || ""}`
            ),
            hotScore: Number(item.HotValue || 0),
          })
        );
    }

    return filtered;
  } catch (error) {
    console.error("Toutiao API failed:", error);
    return fetchFromAggregator();
  }
}

async function fetchFromAggregator(): Promise<HotItem[]> {
  const res = await fetch("https://api.vvhan.com/api/hotlist/toutiao", {
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
      source: "toutiao",
      title: String(item.title || ""),
      url: String(item.url || item.mobilUrl || ""),
      hotScore: Number(item.hot || 0),
    })
  );
}
