import { StructuredToolParams, tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchTool } from "./weather-tools";
import { preprocessArguments } from "../../utils/preprocess";

const fertilizerInfoToolSchema = z.object({
  crop: z.string().optional().describe("Crop name"),
  region: z.string().optional().describe("Region name"),
  soilType: z.string().optional().describe("Soil type"),
  query: z.string().optional().describe("Specific nutrient or management query"),
});

const fertilizerInfoStructuredToolSchema: StructuredToolParams = {
  name: "get_fertilizer_info",
  description: "Fetches accurate fertilizer recommendations, nutrient management strategies, and application dosages tailored to a specific crop, soil type, and region. Use this tool when the user asks about NPK details, soil health, crop nutrition, organic farming inputs, or general fertilizer guidance.",
  schema: fertilizerInfoToolSchema,
};

export const fertilizerInfoTool = tool(async (rawInput: any) => {
  try {
    const input = preprocessArguments("get_fertilizer_info", rawInput);

    // Build query safely (fix for operator precedence bug)
    const cropPart = input.crop ? `crop: ${input.crop}` : "";
    const soilPart = input.soilType ? `soil type: ${input.soilType}` : "";
    const regionPart = input.region ? `region: ${input.region}` : "";
    const queryPart = input.query ? input.query : "";

    const fullQuery = `Fertilizer recommendations for ${[cropPart, soilPart, regionPart, queryPart].filter(Boolean).join(", ")}`;

    // Truncate to avoid 432 Request Header Too Large from Tavily (max ~400 chars safe)
    const safeQuery = fullQuery.slice(0, 400);

    console.log("Fertilizer Tool query:", safeQuery);
    const res = await searchTool.invoke(safeQuery);
    console.log("Fertilizer Info Tool Invoked:: ", res);
    return res;
  } catch (error) {
    console.error("Error while getting Fertilizer info: ", error);
    return "Something went wrong while fetching the Fertilizer information.";
  }
}, fertilizerInfoStructuredToolSchema);
