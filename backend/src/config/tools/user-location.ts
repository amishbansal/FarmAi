import { StructuredToolParams, tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchTool } from "./weather-tools";
import axios from "axios";
import { preprocessArguments } from "../../utils/preprocess";

const userLocationToolScheama = z.object({
  ipAddress: z.string().optional().describe("IP address of the user"),
});

const userLocationParams: StructuredToolParams = {
  name: "user_location",
  description: "Fetches the exact geographical location (City, State, Country, Latitude, Longitude) of the current user based on their IP address request. Use this tool when you need to know the user's location to provide location-specific agricultural advice, weather, or market data if they haven't explicitly mentioned a city.",
  schema: userLocationToolScheama,
};

export const userLocationTool = tool(async (rawInput: any) => {
  const input = preprocessArguments("user_location", rawInput);
  const apiKey = process.env.IPGEOLOCATION_API_KEY;

  try {
    const { data } = await axios.get(`https://api.ipgeolocation.io/ipgeo`, {
      params: {
        apiKey,
        ipAddress: input.ipAddress,
      },
    });

    return {
      ipAddress: input.ipAddress,
      location: {
        city: data.city,
        state_prov: data.state_prov,
        country: data.country_name,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    };
  } catch (err) {
    console.error("Geolocation error:", err);
    return { error: "Failed to fetch location" };
  }
}, userLocationParams);
