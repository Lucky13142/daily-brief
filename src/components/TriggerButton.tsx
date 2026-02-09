"use client";

import { useState } from "react";

export default function TriggerButton() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    async function handleTrigger() {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/cron/daily-job");
            const data = await res.json();
            setResult(res.ok ? `${data.message}` : `失败: ${data.error}`);
        } catch (err) {
            setResult(`请求异常: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <button
                onClick={handleTrigger}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? "生成中，请稍候..." : "手动生成今日海报"}
            </button>
            {result && (
                <p className={`text-sm ${result.startsWith("失败") || result.startsWith("请求") ? "text-red-500" : "text-green-600"}`}>
                    {result}
                </p>
            )}
        </div>
    );
}
