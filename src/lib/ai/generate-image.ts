import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI() {
    if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return _openai;
}

export async function generateImage(prompt: string): Promise<string> {
    const response = await getOpenAI().images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        style: "vivid",
        quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
        throw new Error("DALL-E 3 did not return an image URL");
    }

    return imageUrl;
}
