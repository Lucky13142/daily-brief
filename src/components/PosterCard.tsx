import { Poster } from "@/lib/types";

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    weibo: { label: "微博热搜", color: "text-red-600", bg: "bg-red-50 border-red-200" },
    baidu: { label: "百度热搜", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    hackernews: { label: "HackerNews", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
};

interface PosterCardProps {
    poster: Poster;
}

export default function PosterCard({ poster }: PosterCardProps) {
    const config = SOURCE_CONFIG[poster.source] || {
        label: poster.source,
        color: "text-gray-600",
        bg: "bg-gray-50 border-gray-200",
    };

    return (
        <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
            {/* 海报图片 */}
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={poster.image_url}
                    alt={poster.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                {/* 来源标签 */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}>
                    {config.label}
                </div>
            </div>

            {/* 内容区 */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
                    {poster.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {poster.summary}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                    <time>
                        {new Date(poster.created_at).toLocaleDateString("zh-CN", {
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </time>
                    {poster.raw_data && (
                        <a
                            href={(poster.raw_data as Record<string, string>).url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 hover:underline"
                        >
                            查看原文 &rarr;
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
