import { Poster } from "@/lib/types";

const SOURCE_STYLE: Record<string, { label: string; color: string }> = {
    toutiao: { label: "头条", color: "bg-red-500" },
    baidu: { label: "百度", color: "bg-blue-500" },
};

interface NewsCardProps {
    poster: Poster;
    index: number;
}

export default function NewsCard({ poster, index }: NewsCardProps) {
    const style = SOURCE_STYLE[poster.source] || {
        label: poster.source,
        color: "bg-gray-500",
    };

    const tags: string[] =
        (poster.raw_data as Record<string, unknown>)?.tags as string[] || [];
    const url = (poster.raw_data as Record<string, unknown>)?.url as string || "";

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col gap-2.5">
            {/* 标题 */}
            <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2">
                {poster.title}
            </h3>

            {/* 标签行 */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((tag, i) => (
                    <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] font-medium rounded bg-blue-50 text-blue-600 border border-blue-100"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* 摘要 */}
            <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3">
                {poster.summary}
            </p>

            {/* 底部：来源 + 时间 */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-auto pt-1">
                <span className="flex items-center gap-1">
                    <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${style.color}`}
                    />
                    来源：{style.label}
                </span>
                <time>
                    {new Date(poster.created_at).toLocaleString("zh-CN", {
                        timeZone: "Asia/Shanghai",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </time>
            </div>
        </div>
    );
}
