import { StructuredToolParams, tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchTool } from "./weather-tools";
import { preprocessArguments } from "../../utils/preprocess";

type SearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string | null;
};

function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function replaceYouTubeUrlsWithIframes(results: SearchResult[]): string {
  console.log("Here are the results:", results);
  return results
    ?.map((result) => {
      const videoId = extractYouTubeVideoId(result.url);
      if (!videoId) return ""; // skip invalid URLs

      // Create iframe HTML
      return `
          
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/${videoId}"
              title="${result.title}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
        `;
    })
    .join("\n");
}

const videosRecomenderToolScheama = z.object({
  query: z
    .string()
    .optional()
    .describe("Query to search on internet for agricultural purpose only"),
});

const searchAndRecommendVideoToolSchema: StructuredToolParams = {
  name: "search_and_recomend_youtube_videos",
  description: "Searches YouTube and fetches tutorial or educational video links explicitly for agriculture, farming, crop management, or related queries. Use this when the user explicitly asks for videos, tutorials, visual guides, or demonstrations.",
  schema: videosRecomenderToolScheama,
};

export const searchAndRecommendYoutubeVideosTutorials = tool(
  async (rawInput: any): Promise<string> => {
    try {
      const input = preprocessArguments("search_and_recomend_youtube_videos", rawInput);
      const res = await searchTool.invoke("site:youtube.com " + input.query);
      console.log("Youtube Videos Tools invoked: ", typeof res);

      return res;
    } catch (error) {
      console.error("Error while internet fetching: ", error);
      return "Something went wrong while fetching the information from internet.";
    }
  },
  searchAndRecommendVideoToolSchema
);
