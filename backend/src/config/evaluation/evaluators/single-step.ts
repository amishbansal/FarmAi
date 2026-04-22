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

export async function targetSingleStep(inputs: string): Promise<{
  response: {
    output: string[];
    tool_arguments: Record<string, Record<string, any>>;
  };
}> {
  console.log("Inputs to target function:", inputs);

  const response = await llm.invoke([
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

        `, // Keep as-is
    },
    { role: "user", content: inputs },
  ]);

  console.log("Response from LLM:", response);

  const toolCalls = response.tool_calls || [];

  // Map raw tool names to your preferred tool names

  const output: string[] = [];
  const tool_arguments: Record<string, any> = {};

  for (const call of toolCalls) {
    const originalName = call.name;
    const mappedName = originalName;

    output.push(mappedName);

    tool_arguments[mappedName] = call.args || {};
  }

  const formattedOutput = {
    output,
    tool_arguments,
  };

  console.log("Formatted Output:", formattedOutput);

  return {
    response: formattedOutput,
  };
}

export async function singleaccuracy({
  outputs,
  referenceOutputs,
}: {
  outputs?: Record<string, any>;
  referenceOutputs?: Record<string, any>;
}): Promise<EvaluationResult> {
  console.log("referenceOutputs:", referenceOutputs);
  console.log("outputs:", outputs);

  const predictedTools: string[] = outputs?.response?.output || [];
  const referenceTools: string[] = referenceOutputs?.output || [];

  const toolsMatch =
    referenceTools.length === predictedTools.length &&
    referenceTools.every((tool) => predictedTools.includes(tool));

  const predictedArgs = outputs?.response?.tool_arguments || {};
  const referenceArgs = referenceOutputs?.tool_arguments || {};

  let argumentsMatch = true;

  for (const tool of referenceTools) {
    const refToolArgs = referenceArgs[tool] || {};
    const predToolArgs = predictedArgs[tool] || {};

    const refKeys = Object.keys(refToolArgs).sort();
    const predKeys = Object.keys(predToolArgs).sort();

    // Keys must match exactly
    if (
      refKeys.length !== predKeys.length ||
      !refKeys.every((k, i) => k === predKeys[i])
    ) {
      argumentsMatch = false;
      console.log(
        `Key mismatch in ${tool}: expected keys ${refKeys}, got ${predKeys}`
      );
      break;
    }

    // Values must match exactly
    for (const key of refKeys) {
      const expected = String(refToolArgs[key]).toLowerCase();
      const predicted = String(predToolArgs[key] ?? "").toLowerCase();

      if (key === "query") {
        const expectedWords = expected.split(/\s+/).filter(Boolean);
        const predictedWords = predicted.split(/\s+/).filter(Boolean);

        const matchedWords = expectedWords.filter((word) =>
          predictedWords.includes(word)
        );

        const matchRatio = matchedWords.length / expectedWords.length;

        if (matchRatio < 0.3) {
          argumentsMatch = false;
          console.log(
            `Query mismatch in ${tool} -> ${key}: expected "${expected}", got "${predicted}", match ratio: ${matchRatio}`
          );
          break;
        }
      } else {
        // Strict match for other keys
        if (expected !== predicted) {
          argumentsMatch = false;
          console.log(
            `Mismatch in ${tool} -> ${key}: expected "${expected}", got "${predicted}"`
          );
          break;
        }
      }
    }
  }

  console.log("Tools match:", toolsMatch);
  console.log("Arguments match:", argumentsMatch);

  const isAccurate = toolsMatch && argumentsMatch;

  return {
    key: "accuracy",
    score: isAccurate ? 1 : 0,
  };
}

// function normalize(str: string): string[] {
//   return str
//     .toLowerCase()
//     .replace(/[^\w\s]/g, "") // remove punctuation
//     .split(/\s+/)
//     .filter(Boolean);
// }

// function keywordSimilarity(a: string, b: string): boolean {
//   const wordsA = new Set(normalize(a));
//   const wordsB = new Set(normalize(b));

//   const commonWords = Array.from(wordsA).filter((word) => wordsB.has(word));

//   // Require at least 70% keyword overlap
//   const matchRatio = commonWords.length / Math.max(wordsA.size, wordsB.size);

//   return matchRatio >= 0.7;
// }

// export async function singleaccuracy({
//   outputs,
//   referenceOutputs,
// }: {
//   outputs?: Record<string, any>;
//   referenceOutputs?: Record<string, any>;
// }): Promise<EvaluationResult> {
//   console.log("referenceOutputs:", referenceOutputs);
//   console.log("outputs:", outputs);

//   const predictedTools: string[] = outputs?.response?.output || [];
//   const referenceTools: string[] = referenceOutputs?.output || [];

//   const toolsMatch =
//     referenceTools.length === predictedTools.length &&
//     referenceTools.every((tool) => predictedTools.includes(tool));

//   const predictedArgs = outputs?.response?.tool_arguments || {};
//   const referenceArgs = referenceOutputs?.tool_arguments || {};

//   let argumentsMatch = true;

//   for (const tool of referenceTools) {
//     const refToolArgs = referenceArgs[tool] || {};
//     const predToolArgs = predictedArgs[tool] || {};

//     const refKeys = Object.keys(refToolArgs).sort();
//     const predKeys = Object.keys(predToolArgs).sort();

//     if (
//       refKeys.length !== predKeys.length ||
//       !refKeys.every((k, i) => k === predKeys[i])
//     ) {
//       argumentsMatch = false;
//       console.log(
//         `Key mismatch in ${tool}: expected keys ${refKeys}, got ${predKeys}`
//       );
//       break;
//     }

//     for (const key of refKeys) {
//       const expected = String(refToolArgs[key] ?? "");
//       const predicted = String(predToolArgs[key] ?? "");

//       const isKeywordMatch = keywordSimilarity(expected, predicted);

//       if (!isKeywordMatch) {
//         argumentsMatch = false;
//         console.log(
//           `Mismatch in ${tool} -> ${key}: keyword match failed for "${expected}" vs "${predicted}"`
//         );
//         break;
//       }
//     }

//     if (!argumentsMatch) break;
//   }

//   console.log("Tools match:", toolsMatch);
//   console.log("Arguments match:", argumentsMatch);

//   const isAccurate = toolsMatch && argumentsMatch;

//   return {
//     key: "accuracy",
//     score: isAccurate ? 1 : 0,
//   };
// }
