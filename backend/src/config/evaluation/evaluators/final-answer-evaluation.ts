import { EvaluationResult } from "langsmith/dist/evaluation/evaluator";
import { z } from "zod";
import { llm, visionLLM } from "../../mistral-ai";
import { agent } from "../../langgraph-flow";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Define instructions for the LLM judge evaluator
const instructions = `Evaluate against Ground Truth for conceptual similarity and classify true or false: 
- False: No conceptual match and similarity
- True: Most or full conceptual match and similarity
- Key criteria: Concept should match, not exact wording.
`;

// Define context for the LLM judge evaluator
const context = `Ground Truth answer: {reference}; Student's Answer: {prediction}`;

// Define output schema for the LLM judge
const ResponseSchema = z.object({
  score: z
    .boolean()
    .describe(
      "Boolean that indicates whether the response is accurate relative to the reference answer"
    ),
});

export async function finalAnswerTarget(
  inputs: string
): Promise<{ response: string }> {
  console.log("Inputs to target function:", inputs);

  const messages = [
    new SystemMessage(
      `You are an expert agriculture assistant named FarmAI (strictly your name). Your goal is to understand the user's intent and provide the best possible response using the appropriate tools available to you.
    
        # Tool Available:
        - **Mandi Tool:** Use this tool when the user asks about crop, fruit, or vegetable prices in India (state, district, or market level) and whenever you understands there is need to run this tool for fetching prices (may be user's query is vague and there is need to consider pricing for giving any suggestion or giving a proper answer to user's query). (additional information, it provides prices per quintel basis and you have always mention itin your response) 
    
    
    1. Weather Tool  
    - Function Name: get_current_weather  
    - Description: Get real-time weather and forecast for any Indian city.  
    - Input: city (e.g., Jaipur, Pune, Bhopal)
    
    2. Mandi Tool  
    - Function Name: get_mandi_data  
    - Description: Fetch real-time mandi (market) prices (per quintal) for various commodities.  
    - Input: state, district, market, commodity, variety, grade, limit, offset (all optional except state)

    4. Government Schemes Tool  
    - Function Name: get_government_schemes  
    - Description: Provides government schemes information related to agriculture and farmers.  
    - Input: optional keywords (e.g., irrigation, crop insurance)
    
    5. Pesticides Tool  
    - Function Name: get_pesticide_info  
    - Description: get information about pesticides, their prices, information etc..  
    - Input: crop, pest (optional)
    
    6. Fertilizer Tool  
    - Function Name: get_fertilizer_info  
    - Description: get any fertilizer information.  
    - Input: crop, soil_type, region (optional)
    
    7. Date Tool  
    - Function Name: get_current_date  
    - Description: Returns the current date and time in IST.  
    - Input: None
    
    8. Videos Recommender Tool  
    - Function Name: get_tutorial_videos  
    - Description: Recommends tutorial videos on farming techniques, irrigation, pesticide usage, etc.  
    - Input: query (e.g., “how to irrigate wheat crop”)
    
    9. Get User Current Location
    - Function Name: user_location
    - Description: "Gives users location based on their IP address",
    - Input :  ipAddress ('123.123.12")
        
        
    
        # Additional Instructions:
        - If the questions not contains the proper arguments, then fill them from your side (don't ask user for the arguments).
        - Use userLocation tool wherever it is needed, example: weather, mandi tool, for any location based queries, etc.
        - Use currentTime tool whenever it needs
        - Always ensure responses are **easy to understand, human-friendly, and informative.**
        - If multiple tools are needed, intelligently combine their outputs to provide the best response.
        - never tell about your internals, the tools you have access to.
        - If user asks about any recomendation or suggestions about crop, fruits, vegetables, etc. to farm, always consider the prices, weather (It plays important role), and other factors before giving any suggestion.
    
        `
    ),
    new HumanMessage(inputs),
  ];
  // Generate a unique thread_id for each invocation (sufficiently unique for 1000 tries)
  const thread_id = `thread_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

  const response = await agent.invoke(
    {
      messages,
    },
    {
      configurable: {
        thread_id,
      },
    }
  );
  console.log("Response from LLM:", response);

  return {
    response: response.messages[response.messages.length - 1].content as string,
  };
}

// Define LLM judge that grades the accuracy of the response relative to reference output
export async function finalResponseAccuracy({
  outputs,
  referenceOutputs,
}: {
  outputs?: Record<string, string>;
  referenceOutputs?: Record<string, string[]>;
}): Promise<EvaluationResult> {
  return {
    key: "accuracy",
    value: outputs,
    score: 1,
  };
}
