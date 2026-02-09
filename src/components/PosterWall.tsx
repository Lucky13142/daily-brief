import { Poster } from "@/lib/types";
import PosterCard from "./PosterCard";

interface PosterWallProps {
    posters: Poster[];
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
                <p className="text-lg font-medium">暂无海报</p>
                <p className="text-sm mt-1">每天早上 8:00 自动生成今日热点海报</p>
            </div>
        );
    }

    // 按日期分组
    const grouped = posters.reduce<Record<string, Poster[]>>((acc, poster) => {
        const dateKey = new Date(poster.created_at).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(poster);
        return acc;
    }, {});

    return (
        <div className="space-y-10">
            {Object.entries(grouped).map(([date, datPosters]) => (
                <section key={date}>
                    <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                        {date}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {datPosters.map((poster) => (
                            <PosterCard key={poster.id} poster={poster} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
