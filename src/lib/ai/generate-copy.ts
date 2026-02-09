import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { HotItem, GeneratedCopy } from "../types";

let _model: ChatOpenAI | null = null;
function getModel() {
    if (!_model) {
        _model = new ChatOpenAI({
            modelName: "gpt-4o",
            temperature: 0.7,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
    }
    return _model;
}

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `你是一位专业的新闻编辑和视觉设计师。你需要根据给定的热搜话题，完成两项任务：
1. 撰写一段简洁有力的中文摘要（100字以内），要求信息量大、引人注目
2. 生成一段英文 DALL-E 绘图 Prompt，用于生成一张与该新闻相关的海报风格插画

请严格按照以下 JSON 格式输出：
{{
  "summary": "中文摘要内容",
  "imagePrompt": "English DALL-E prompt for poster illustration"
}}

关于绘图 Prompt 的要求：
- 风格：现代海报插画风，色彩鲜艳醒目
- 不要包含任何文字或字母
- 要抽象地表达新闻主题的核心意象
- 适合作为社交媒体分享的正方形海报`,
    ],
    [
        "human",
        `热搜来源：{source}
热搜标题：{title}
热搜链接：{url}`,
    ],
]);

const parser = new JsonOutputParser<GeneratedCopy>();

export async function generateCopy(hotItem: HotItem): Promise<GeneratedCopy> {
    const sourceMap: Record<string, string> = {
        weibo: "微博热搜",
        baidu: "百度热搜",
        hackernews: "HackerNews",
    };

    const chain = prompt.pipe(getModel()).pipe(parser);

    const result = await chain.invoke({
        source: sourceMap[hotItem.source] || hotItem.source,
        title: hotItem.title,
        url: hotItem.url,
    });

    return {
        summary: result.summary,
        imagePrompt: result.imagePrompt,
    };
}
