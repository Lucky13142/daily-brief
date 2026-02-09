import { sql } from "@vercel/postgres";
import { Poster } from "./types";

export async function insertPoster(poster: {
    source: string;
    title: string;
    summary: string;
    image_url: string;
    image_prompt: string;
    hot_rank: number;
    raw_data: Record<string, unknown>;
}): Promise<void> {
    await sql`
    INSERT INTO posters (source, title, summary, image_url, image_prompt, hot_rank, raw_data)
    VALUES (
      ${poster.source},
      ${poster.title},
      ${poster.summary},
      ${poster.image_url},
      ${poster.image_prompt},
      ${poster.hot_rank},
      ${JSON.stringify(poster.raw_data)}
    )
  `;
}

export async function getRecentPosters(limit = 30): Promise<Poster[]> {
    const { rows } = await sql`
    SELECT * FROM posters
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
    return rows as Poster[];
}
