import PosterWall from "@/components/PosterWall";
import TriggerButton from "@/components/TriggerButton";
import { getRecentPosters } from "@/lib/db";
import { Poster } from "@/lib/types";

async function getPosters(): Promise<Poster[]> {
  try {
    return await getRecentPosters(50);
  } catch (error) {
    console.error("Failed to fetch posters:", error);
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posters = await getPosters();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">📰</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Daily Brief
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500">AI & 经济热点资讯</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-400 text-right">
            {new Date().toLocaleDateString("zh-CN", {
              timeZone: "Asia/Shanghai",
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </div>
        </div>
      </header>

      {/* 操作按钮 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <TriggerButton />
      </div>

      {/* 海报内容 */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pb-8 sm:pb-12">
        <PosterWall posters={posters} />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-gray-400">
          数据来源：今日头条 / 百度热搜
        </div>
      </footer>
    </main>
  );
}
