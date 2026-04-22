import { StructuredToolParams, tool } from "@langchain/core/tools"
import { z } from "zod";
import { searchTool } from "./weather-tools";
import { preprocessArguments } from "../../utils/preprocess";

const governmentSchemesToolScheama = z.object({
  query: z.string().optional().describe("Broad search query for government schemes, e.g., 'Latest schemes for rice farmers in Punjab'"),
});

const governmentSchemes: StructuredToolParams = {
  name: "get_government_schemes",
  description: "A specialized tool exclusively for retrieving information about Indian government schemes, subsidies, PM-KISAN, yojanas, agricultural policies, and financial farmer benefits. Prefer this heavily over general internet searches for any government-related subsidy or loan queries.",
  schema: governmentSchemesToolScheama
};

export const governmentSchemesTool = tool(async (rawInput: any): Promise<string> => {
  try {
    const input = preprocessArguments("get_government_schemes", rawInput);

    // Ensure we have a valid query string, falling back to a default if empty
    const searchQuery = (input.query && input.query.trim().length > 0)
      ? input.query
      : "latest government schemes for Indian farmers 2024 2025";

    console.log("Government schemes tool searching for:", searchQuery);
    const res = await searchTool.invoke(searchQuery);
    console.log("Government schemes tool result length:", res.length);

    return res;
  } catch (error) {
    console.error("Error while getting government schemes tools: ", error);
    return "Something went wrong while fetching the government schemes.";
  }
}, governmentSchemes)