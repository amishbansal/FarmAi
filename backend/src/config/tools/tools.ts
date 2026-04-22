import { ToolNode } from "@langchain/langgraph/prebuilt";
import { weatherTool } from "./weather-tools";
import { mandiTool } from "./mandi-tool";
import { currentDateTool } from "./get-current-date";
import { governmentSchemesTool } from "./government-schemes-tool";
import { internetSearchTool } from "./internet-search-tool";
import { searchAndRecommendYoutubeVideosTutorials } from "./videos-recomender-agriculture";
import { userLocationTool } from "./user-location";
import { pestcidesInfoTool } from "./get-pesticides-info";
import { fertilizerInfoTool } from "./get-fertilizer-info";
import { globalComodityInfoTool } from "./get-global-market-price";

export const tools = [
  weatherTool,
  mandiTool,
  currentDateTool,
  governmentSchemesTool,
  internetSearchTool,
  searchAndRecommendYoutubeVideosTutorials,
  userLocationTool,
  pestcidesInfoTool,
  fertilizerInfoTool,
  globalComodityInfoTool
];

export const toolNode = new ToolNode(tools);
