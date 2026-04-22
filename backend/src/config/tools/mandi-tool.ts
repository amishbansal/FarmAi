import axios from "axios";
import { StructuredToolParams, tool } from "@langchain/core/tools";
import { z } from "zod";
import { redis } from "../caching/redis.config";
import MarketPriceModel from "../../models/marketPrice.model";
import { toTitleCase, escapeRegExp } from "../../utils/helpers";
import { preprocessArguments } from "../../utils/preprocess";

const API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const API_KEY = process.env.MANDI_API_KEY;

async function fetchFromAPI(query: any): Promise<string | null> {
  if (!API_KEY) {
    console.warn("MANDI_API_KEY not set. Skipping API fetch.");
    return null;
  }

  try {
    const params: any = {
      "api-key": API_KEY,
      format: "json",
      limit: query.limit ?? 10,
      offset: query.offset ?? 0,
    };

    // Exact mapping of query params might vary based on API documentation
    // This is a best-effort mapping based on typical OGD filters
    if (query.state) params["filters[state]"] = query.state;
    if (query.district) params["filters[district]"] = query.district;
    if (query.market) params["filters[market]"] = query.market;
    if (query.commodity) params["filters[commodity]"] = query.commodity;
    if (query.variety) params["filters[variety]"] = query.variety;
    if (query.grade) params["filters[grade]"] = query.grade;


    const response = await axios.get(API_URL, { params });

    const records = response.data?.records;
    if (records && records.length > 0) {

      return JSON.stringify(records, null, 2);
    }

    return null;

  } catch (error) {
    console.error("Error fetching from Mandi API:", error);
    return null;
  }
}


const mandiToolSchema = z.object({
  state: z
    .string()
    .optional()
    .describe("The state for which mandi data is required, eg: Andhra Pradesh"),
  district: z
    .string()
    .optional()
    .describe("The district for which mandi data is required"),
  market: z.string().optional().describe("The market name for mandi data"),
  commodity: z
    .string()
    .optional()
    .describe("The commodity name to fetch market prices, eg: Tomato"),
  variety: z.string().optional().describe("The variety of the commodity"),
  grade: z.string().optional().describe("The grade of the commodity"),
  limit: z.number().optional().describe("Number of records to fetch"),
  offset: z.number().optional().describe("Offset for pagination"),
});

const mandiToolParams: StructuredToolParams = {
  name: "get_mandi_data",
  description: "Fetches accurate, real-time daily commodity prices (Mandi rates) from Indian agricultural markets. EXCLUSIVE AND ONLY tool for local crop pricing, market rates, and mandi queries in India. Do NOT guess or modify location/district names. Keep commodity query singular.",
  schema: mandiToolSchema,
};

export const mandiTool = tool(async (rawInput: any): Promise<string> => {
  try {
    const input = preprocessArguments("get_mandi_data", rawInput);

    const startTime = performance.now();

    const query: Record<string, any> = {};

    if (input.state)
      query.State = { $regex: new RegExp(escapeRegExp(input.state), "i") };
    if (input.district)
      query.District = { $regex: new RegExp(escapeRegExp(input.district), "i") };
    if (input.market)
      query.Market = { $regex: new RegExp(escapeRegExp(input.market), "i") };
    if (input.commodity)
      query.Commodity = { $regex: new RegExp(escapeRegExp(input.commodity), "i") };
    if (input.variety)
      query.Variety = { $regex: new RegExp(escapeRegExp(input.variety), "i") };
    if (input.grade)
      query.Grade = { $regex: new RegExp(escapeRegExp(input.grade), "i") };

    const limit = input.limit ?? 10;
    const offset = input.offset ?? 0;

    const cacheKey = `mandi:${JSON.stringify(input)}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }



    const mandiData = await MarketPriceModel.find(query)
      .limit(limit)
      .skip(offset)
      .lean(); // `.lean()` improves performance by returning plain JS objects

    const endTime = performance.now();




    if (!mandiData.length) {

      try {
        const apiData = await fetchFromAPI(input);
        if (apiData) {
          // Cache the API result
          const daa = await redis.set(cacheKey, apiData, "EX", 3600);

          return apiData;
        }
      } catch (apiError) {
        console.error("API Fetch failed:", apiError);
      }
      return "No mandi data found in database or API.";
    }

    const result = JSON.stringify(mandiData, null, 2);

    try {
      // Cache results for 1 hour (3600 seconds)
      await redis.set(cacheKey, result, "EX", 3600);
    } catch (error) {
      console.error("Error caching mandi data:", error);
    }

    return result;
  } catch (error) {
    console.error("Error fetching mandi data from MongoDB:", error);
    return "Failed to fetch mandi data. Please try again later.";
  }
}, mandiToolParams);
