import { StructuredToolParams, tool } from "@langchain/core/tools";
import { z } from "zod";
//@ts-ignore
import moment from "moment-timezone";
import { redis } from "../caching/redis.config";

const currentDateToolSchema: StructuredToolParams = {
  name: "get_current_date",
  description: "Fetches the exact current real-time date and time in Asia/Kolkata timezone. Use this whenever the user asks for 'today', 'now', or references a relative time like 'this month', 'current year', etc. No input parameters necessary.",
  schema: z.object({}),
};

export const currentDateTool = tool(async (): Promise<string> => {
  try {
    console.log("Current Date Tool Invoked");
    const startTime = performance.now();

    const cacheKey = "current_date:Asia/Kolkata";

    // Check Redis cache
    const cachedDate = await redis.get(cacheKey);
    if (cachedDate) {
      console.log("From Cache: ", cachedDate);
      return cachedDate;
    }

    // Get current date & time in Asia/Kolkata
    const currentDate = moment()
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss");
    const response = `Current date and time in Asia/Kolkata: ${currentDate}`;

    // Cache result for 1 hour (3600s)
    await redis.set(cacheKey, response, "EX", 3600);

    const endTime = performance.now();
    console.log(
      `Current date exec time: ${(endTime - startTime).toFixed(2)} ms`
    );

    return response;
  } catch (error) {
    console.error(error);
    return "Something went wrong while fetching the current date.";
  }
}, currentDateToolSchema);
