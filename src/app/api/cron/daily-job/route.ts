import { NextRequest, NextResponse } from "next/server";
import { fetchToutiaoHotList } from "@/lib/scrapers/toutiao";
import { fetchBaiduHotList } from "@/lib/scrapers/baidu";
import { insertPoster } from "@/lib/db";
import { HotItem } from "@/lib/types";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Daily Job] Started at ${new Date().toISOString()}`);

    try {
        // 1. 并行获取两个来源的热搜列表
        const [toutiaoItems, baiduItems] = await Promise.allSettled([
            fetchToutiaoHotList(),
            fetchBaiduHotList(),
        ]);

        const allItems: HotItem[] = [];
        if (toutiaoItems.status === "fulfilled") allItems.push(...toutiaoItems.value);
        if (baiduItems.status === "fulfilled") allItems.push(...baiduItems.value);

        // 过滤无效条目（空标题、标题太短）
        const validItems = allItems.filter(
            (item) => item.title && item.title.trim().length >= 4
        );

        if (validItems.length === 0) {
            return NextResponse.json(
                { error: "All scrapers failed", toutiaoItems, baiduItems },
                { status: 500 }
            );
        }

        console.log(`[Daily Job] Fetched ${validItems.length} valid hot items`);

        // 2. 批量调用 AI 生成摘要和标签（动态导入）
        const { generateNewsBatch } = await import("@/lib/ai/generate-copy");
        const newsItems = await generateNewsBatch(validItems);

        console.log(`[Daily Job] Generated ${newsItems.length} news summaries`);

        // 3. 写入数据库（跳过摘要为空的条目）
        let successCount = 0;
        for (let i = 0; i < validItems.length; i++) {
            if (!newsItems[i]?.summary || newsItems[i].summary.trim().length < 5) {
                console.warn(`Skipped empty summary: ${validItems[i].title}`);
                continue;
            }
            try {
                await insertPoster({
                    source: validItems[i].source,
                    title: newsItems[i].title,
                    summary: newsItems[i].summary,
                    hot_rank: i + 1,
                    raw_data: {
                        url: validItems[i].url,
                        hotScore: validItems[i].hotScore,
                        tags: newsItems[i].tags,
                    },
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to insert: ${validItems[i].title}`, err);
            }
        }

        return NextResponse.json({
            message: `Daily job completed: ${successCount}/${validItems.length} saved`,
            count: validItems.length,
            successCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Daily job fatal error:", error);
        return NextResponse.json(
            {
                error: "Daily job failed",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
