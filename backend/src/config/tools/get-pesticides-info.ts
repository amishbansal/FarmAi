import { StructuredToolParams, tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchTool } from "./weather-tools";
import { preprocessArguments } from "../../utils/preprocess";

const pesticidesInfoToolSchema = z.object({
  crop: z.string().describe("Crop name"),
  pest: z.string().optional().describe("Pest name"),
});

const pesticidesInfoStructuredToolSchema: StructuredToolParams = {
  name: "get_pesticide_info",
  description: "Fetches specific pesticide, insecticide, or disease management recommendations for a given crop and pest/disease. Use this tool when the user describes plant sickness, bug infestations, leaf curling, or explicitly asks for chemical or organic control methods for pests and diseases.",
  schema: pesticidesInfoToolSchema,
};

export const pestcidesInfoTool = tool(async (rawInput: any) => {
  try {
    const input = preprocessArguments("get_pesticide_info", rawInput);

    const res = await searchTool.invoke(
      "pesticides for " + input.crop + " " + input?.pest ? input.pest : ""
    );
    console.log("Pesticides Info Tool Invoked:: ", res);
    return res;
  } catch (error) {
    console.error("Error while getting pesticides info: ", error);
    return "Something went wrong while fetching the pesticides information.";
  }
}, pesticidesInfoStructuredToolSchema);
