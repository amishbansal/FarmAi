import { StructuredToolParams, tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchTool } from "./weather-tools";
import { preprocessArguments } from "../../utils/preprocess";

const globalMarketInfoToolSchema = z.object({
  comodity: z.string().describe("Comodity name"),
  country: z.string().optional().describe("Country Name, this is optional can ignore if not provded"),
});

const globalInfoStructuredToolSchema: StructuredToolParams = {
  name: "get_global_market_comodity_info",
  description: "Retrieves global or international export market prices for commodities. USE THIS ONLY for international/export queries. DO NOT use this for local Indian market pricing (use get_mandi_data instead for Indian prices).",
  schema: globalMarketInfoToolSchema,
};

export const globalComodityInfoTool = tool(async (rawInput: any) => {
  try {
    const input = preprocessArguments("get_global_market_comodity_info", rawInput);

    const res = await searchTool.invoke(
      "site:numbeo.com global market export price for " + input.comodity + input.country ? " in " + input.country : "",
    );
    console.log("comodity Info Tool Invoked:: ", res);
    return res;
  } catch (error) {
    console.error("Error while getting comodity international info: ", error);
    return "Something went wrong while fetching the comodity information from international market.";
  }
}, globalInfoStructuredToolSchema);
