import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { HotItem, GeneratedNewsItem } from "../types";

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

const batchPrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `你是一位专业的科技与财经新闻编辑。请为每条热搜新闻生成：
1. 一段简洁有力的中文摘要（60字以内），信息量大、引人注目
2. 2-3个关键标签（每个标签2-4个字）

请严格按照以下 JSON 数组格式输出（与输入数量一一对应）：
[
  {{
    "title": "原始标题",
    "summary": "中文摘要",
    "tags": ["标签1", "标签2"]
  }}
]

标签要求：
- 提取核心关键词，如公司名、技术名、政策名
- 简短精炼，2-4个字`,
    ],
    [
        "human",
        `以下是{count}条热搜新闻，请逐条生成摘要和标签：

{newslist}`,
    ],
]);

const parser = new JsonOutputParser<GeneratedNewsItem[]>();

export async function generateNewsBatch(
    items: HotItem[]
): Promise<GeneratedNewsItem[]> {
    const newslist = items
        .map((item, i) => `${i + 1}. 【${item.source === "toutiao" ? "今日头条" : "百度热搜"}】${item.title}`)
        .join("\n");

    const chain = batchPrompt.pipe(getModel()).pipe(parser);

    const result = await chain.invoke({
        count: String(items.length),
        newslist,
    });

    // 确保返回数量一致，补全缺失项
    return items.map((item, i) => ({
        title: item.title,
        summary: result[i]?.summary || item.title,
        tags: result[i]?.tags || [],
    }));
}
