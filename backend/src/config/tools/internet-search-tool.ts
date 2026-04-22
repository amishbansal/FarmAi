import { StructuredToolParams, tool } from "@langchain/core/tools"
import { z } from "zod";
import { searchTool } from "./weather-tools";
import { preprocessArguments } from "../../utils/preprocess";

const internetSearchToolScheama = z.object({
  query: z.string().optional().describe("Query to search on internet for agricultural purpose only"),
});

const internetSearchToolSchema: StructuredToolParams = {
  name: "internet_search_tool",
  description: "Performs a broad internet search for general agricultural advice or farming techniques. USE AS A LAST RESORT ONLY when no other specific tool (like mandi data, schemes, weather, pesticides, fertilizers) applies. Do not attempt to use this for real-time local mandi prices or government scheme lookups.",
  schema: internetSearchToolScheama
};

export const internetSearchTool = tool(async (rawInput: any): Promise<string> => {

  try {
    const input = preprocessArguments("internet_search_tool", rawInput);
    const res = await searchTool.invoke(input.query);
    console.log("Internet Search Tool Invoked:: ", res)

    return res;
  } catch (error) {
    console.error("Error while internet fetching ", error);
    return "Something went wrong while fetching the information from internet.";
  }
}, internetSearchToolSchema)