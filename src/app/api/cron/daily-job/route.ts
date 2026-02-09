import { NextRequest, NextResponse } from "next/server";
import { fetchWeiboHot } from "@/lib/scrapers/weibo";
import { fetchBaiduHot } from "@/lib/scrapers/baidu";
import { fetchHackerNewsHot } from "@/lib/scrapers/hackernews";
import { insertPoster } from "@/lib/db";
import { HotItem } from "@/lib/types";

export const maxDuration = 300; // 5 分钟超时（图片生成较慢）

export async function GET(request: NextRequest) {
    // 鉴权：Vercel Cron 自动发送 Authorization: Bearer <CRON_SECRET>
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Daily Job] Started at ${new Date().toISOString()}`);

    const results: Array<{
        source: string;
        title: string;
        success: boolean;
        error?: string;
    }> = [];

    try {
        // 1. 并行获取三个来源的热搜
        const scrapers = [
            { name: "weibo", fn: fetchWeiboHot },
            { name: "baidu", fn: fetchBaiduHot },
            { name: "hackernews", fn: fetchHackerNewsHot },
        ];

        const hotItems = await Promise.allSettled(
            scrapers.map((s) => s.fn())
        );

        // 2. 逐条处理每个热搜
        for (let i = 0; i < hotItems.length; i++) {
            const result = hotItems[i];
            const scraperName = scrapers[i].name;

            if (result.status === "rejected") {
                console.error(`Scraper ${scraperName} failed:`, result.reason);
                results.push({
                    source: scraperName,
                    title: "N/A",
                    success: false,
                    error: String(result.reason),
                });
                continue;
            }

            const hotItem: HotItem = result.value;

            try {
                // 3. AI 生成文案和绘图 Prompt（动态导入，避免模块加载时初始化 OpenAI）
                const { generateCopy } = await import("@/lib/ai/generate-copy");
                console.log(`Generating copy for: ${hotItem.title}`);
                const copy = await generateCopy(hotItem);

                // 4. DALL-E 3 生成图片
                const { generateImage } = await import("@/lib/ai/generate-image");
                console.log(`Generating image for: ${hotItem.title}`);
                const imageUrl = await generateImage(copy.imagePrompt);

                // 5. 写入 Vercel Postgres
                await insertPoster({
                    source: hotItem.source,
                    title: hotItem.title,
                    summary: copy.summary,
                    image_url: imageUrl,
                    image_prompt: copy.imagePrompt,
                    hot_rank: 1,
                    raw_data: {
                        url: hotItem.url,
                        hotScore: hotItem.hotScore,
                    },
                });

                results.push({
                    source: hotItem.source,
                    title: hotItem.title,
                    success: true,
                });

                console.log(`Successfully processed: ${hotItem.title}`);
            } catch (err) {
                console.error(`Processing failed for ${hotItem.title}:`, err);
                results.push({
                    source: hotItem.source,
                    title: hotItem.title,
                    success: false,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }

        const successCount = results.filter((r) => r.success).length;

        return NextResponse.json({
            message: `Daily job completed: ${successCount}/${results.length} succeeded`,
            results,
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
