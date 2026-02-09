import { Poster } from "@/lib/types";
import NewsCard from "./PosterCard";

interface PosterWallProps {
    posters: Poster[];
}

function getChinaDateStr() {
    return new Date().toLocaleDateString("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function PosterWall({ posters }: PosterWallProps) {
    if (posters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"
                    />
                </svg>
                <p className="text-lg font-medium">暂无资讯</p>
                <p className="text-sm mt-1">点击上方按钮手动生成，或等待每天早上 8:00 自动生成</p>
            </div>
        );
    }

    return (
        <div id="poster-content" className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-100">
            {/* 海报头部 */}
            <div className="text-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-wide">
                    今日AI&amp;经济资讯
                </h2>
                <p className="text-gray-400 text-sm mt-2">{getChinaDateStr()}</p>
            </div>

            {/* 两列新闻网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posters.map((poster, index) => (
                    <NewsCard key={poster.id} poster={poster} index={index} />
                ))}
            </div>

            {/* 海报底部 */}
            <div className="text-center text-xs text-gray-300 mt-6 pt-4 border-t border-gray-100">
                数据来源：今日头条 / 百度热搜 · AI 智能摘要生成
            </div>
        </div>
    );
}
