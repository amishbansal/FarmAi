import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import { redis } from "../caching/redis.config";
import { toTitleCase } from "../../utils/helpers";
import { preprocessArguments } from "../../utils/preprocess";

const OPENWEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

export const searchTool = new TavilySearchResults({
  maxResults: 3,
  apiKey: process.env.TAVILY_API_KEY!,
});

const weatherToolIPSchema = z.object({
  city: z.string().describe("City name for which you want to get the weather"),
});

export const weatherTool = tool(async (rawInput: z.infer<typeof weatherToolIPSchema>): Promise<string> => {
  const input = preprocessArguments("get_current_weather", rawInput);
  const cacheKey = `weather:${toTitleCase(input.city)}`;
  try {
    console.log("Weather tool invoked with city (processed):", input.city);
    const startTime = performance.now();

    if (!OPENWEATHER_API_KEY) {
      console.warn("OPENWEATHERMAP_API_KEY not set.");
      return "Weather service is currently unavailable (missing API key).";
    }


    const weatherData = await redis.get(cacheKey);

    if (weatherData) {
      console.log("From Caching: ", weatherData);
      const endTime = performance.now();
      console.log(
        `weather exec time took ${(endTime - startTime).toFixed(2)} ms`
      );
      return weatherData;
    }

    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(toTitleCase(
        input.city
      ))}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );

    const endTime = performance.now();
    console.log(
      `weather exec time took ${(endTime - startTime).toFixed(2)} ms`
    );

    const data = JSON.stringify(res.data);

    // Cache for 24 hours
    await redis.set(cacheKey, data, "EX", 86400);

    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`City "${input.city}" not found in OpenWeatherMap. Falling back to internet search...`);
      try {
        const searchResult = await searchTool.invoke(`current weather in ${input.city}`);

        // Cache the search result as well to avoid redundant searches
        await redis.set(cacheKey, searchResult, "EX", 3600); // Cache search result for 1 hour

        return `I couldn't find "${input.city}" in the standard weather database, but here is what I found online: \n\n${searchResult}`;
      } catch (searchError: any) {
        console.error("Weather fallback search error:", searchError.message);
        return `Could not find weather data for city: "${input.city}". Please check the spelling.`;
      }
    }
    if (error.response?.status === 401) {
      return "Weather service authentication failed. Please check the API key.";
    }
    console.error("Weather tool error:", error.message);
    return `Something went wrong while getting weather data for ${input.city}.`;
  }
}, {
  name: "get_current_weather",
  description: "Retrieves the real-time weather conditions and forecast for any city worldwide. Always use this to provide climate, temperature, or rainfall information when advising on crop sowing, watering, or harvesting schedules.",
  schema: weatherToolIPSchema,
});
