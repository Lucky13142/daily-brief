"use client";

import { useState } from "react";
import { toPng } from "html-to-image";

export default function TriggerButton() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    async function handleTrigger() {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/cron/daily-job");
            const data = await res.json();
            if (res.ok) {
                setResult(`${data.message}`);
                // 生成成功后刷新页面展示新数据
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setResult(`失败: ${data.error}`);
            }
        } catch (err) {
            setResult(
                `请求异常: ${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload() {
        const el = document.getElementById("poster-content");
        if (!el) return;

        try {
            const dataUrl = await toPng(el, {
                backgroundColor: "#f0f7ff",
                pixelRatio: 2,
                style: {
                    borderRadius: "0",
                },
            });
            const link = document.createElement("a");
            const dateStr = new Date().toLocaleDateString("zh-CN", {
                timeZone: "Asia/Shanghai",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).replace(/\//g, "-");
            link.download = `今日AI经济资讯_${dateStr}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Download failed:", err);
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                    onClick={handleTrigger}
                    disabled={loading}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    {loading ? "生成中，请稍候..." : "手动生成今日资讯"}
                </button>
                <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-full shadow-md border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all active:scale-95"
                >
                    下载海报图片
                </button>
            </div>
            {result && (
                <p
                    className={`text-sm ${result.startsWith("失败") || result.startsWith("请求")
                        ? "text-red-500"
                        : "text-green-600"
                        }`}
                >
                    {result}
                </p>
            )}
        </div>
    );
}
