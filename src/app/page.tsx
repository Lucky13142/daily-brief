import PosterWall from "@/components/PosterWall";
import { getRecentPosters } from "@/lib/db";
import { Poster } from "@/lib/types";

async function getPosters(): Promise<Poster[]> {
  try {
    return await getRecentPosters(30);
  } catch (error) {
    console.error("Failed to fetch posters:", error);
    return [];
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 3600; // ISR: 每小时重新验证

export default async function HomePage() {
  const posters = await getPosters();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📰</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Daily Brief
              </h1>
              <p className="text-xs text-gray-500">
                每日热点，AI 生成海报
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PosterWall posters={posters} />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400">
          <p>
            Powered by GPT-4o & DALL-E 3 · 数据来源：微博 / 百度 / HackerNews
          </p>
        </div>
      </footer>
    </main>
  );
}
