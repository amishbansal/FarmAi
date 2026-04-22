import { EvaluationResult } from "langsmith/dist/evaluation/evaluator";
import { z } from "zod";
import { llm, visionLLM } from "../../mistral-ai";

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

export async function target(inputs: string): Promise<{ response: string[] }> {
  console.log("Inputs to target function:", inputs);
  const response = await visionLLM.invoke([
    {
      role: "system",
      content: `You are an expert agriculture assistant named FarmAI (strictly your name). Your goal is to understand the user's intent and provide the best possible response using the appropriate tools available to you.

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

3. Global Market Prices Tool  
   - Function Name: get_global_commodity_prices  
   - Description: Fetch international commodity prices and trends.  
   - Input: commodity

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

        `,
    },
    { role: "user", content: inputs },
  ]);
  console.log("Response from LLM:", response);

  const toolCallsStringArray = response.tool_calls?.map((call) => {
    return call.name.toString();
  });

  console.log("Tool calls string array:", toolCallsStringArray);

  return {
    response: toolCallsStringArray || [""],
  };
}

// Define LLM judge that grades the accuracy of the response relative to reference output
export async function accuracy({
  outputs,
  referenceOutputs,
}: {
  outputs?: Record<string, string>;
  referenceOutputs?: Record<string, string[]>;
}): Promise<EvaluationResult> {
  // const response = await llm.invoke([
  //   { role: "system", content: instructions },
  //   {
  //     role: "user",
  //     content: context
  //       .replace("{prediction}", outputs?.answer || "")
  //       .replace("{reference}", referenceOutputs?.output || ""),
  //   },

  // ]);

  console.log("referenceOutputs:", referenceOutputs);
  console.log("outputs:", outputs);

  // Handling response tool calls: check if it's an array or object
  // console.log("Response from LLM:", response.tool_calls);
  // let toolCallsResponse = response.tool_calls;

  // If tool_calls is an array, handle the first element or adjust accordingly
  // if (Array.isArray(toolCallsResponse)) {
  //   // Assuming the first element contains the expected response
  //   toolCallsResponse = {
  //     toolsCalled: toolCallsResponse.length > 0 ? toolCallsResponse[0] : [],
  //   };
  // }

  // Log the toolCallsResponse to inspect it
  // console.log("toolCallsResponse:", toolCallsResponse);

  // Ensure the response contains a 'score' field
  let parsedResponse = { score: false }; // Default value in case no score is found

  // if (toolCallsResponse && typeof toolCallsResponse === "object") {
  //   // Check if toolCallsResponse contains a score
  //   if (toolCallsResponse.hasOwnProperty("score")) {
  //     parsedResponse = {
  //       score: toolCallsResponse.score === true, // Ensure score is a boolean
  //     };
  //   }
  // }

  // If no score was found, you could calculate the score yourself (e.g., using some similarity metric)
  // For example, if you wanted to set it based on the conceptual similarity of the answers:
  if (parsedResponse.score === false) {
    let isTrue = false;

    if (outputs?.response && referenceOutputs?.output) {
      let expectedOutputs = Array.isArray(referenceOutputs.output)
        ? referenceOutputs.output
        : [referenceOutputs.output]; // Ensure it's always an array

      console.log("Expected Outputs:", expectedOutputs);
      console.log("Outputs Response:", outputs.response);

      // let matchedCount = 0;
      let allMatched = expectedOutputs.every((ref) => {
        // if(outputs.response.includes(ref)){
        //   matchedCount++;
        //   console.log("Matched:", ref);
        // }
        return outputs.response.includes(ref);
      });

      isTrue = allMatched;
    }
    parsedResponse.score = isTrue;
  }

  // Ensure the parsed response matches the schema
  const parsedResult = ResponseSchema.parse(parsedResponse);
  console.log("Parsed Result:", parsedResult.score);

  return {
    key: "accuracy",
    score: parsedResult.score,
  };
}
