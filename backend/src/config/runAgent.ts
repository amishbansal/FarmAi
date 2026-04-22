import "dotenv/config";
import { agent } from "./langgraph-flow";

import { SystemMessage } from "@langchain/core/messages";
import { SYSTEM_PROMPT } from "./prompts";
import { preprocessQuery } from "../utils/preprocess";

/**
 * Run the LangGraph agent for evaluation
 */
export async function runAgent(question: string) {
  const processedQuestion = preprocessQuery(question);
  const result = await agent.invoke({
    messages: [
      new SystemMessage(SYSTEM_PROMPT),
      {
        role: "user",
        content: processedQuestion,
      },
    ],
  }, {
    configurable: {
      thread_id: `eval-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    },
  });

  console.log("Graph result messages count:", result.messages.length);

  /**
   * For evaluation, we want to find ALL tool calls that were made.
   * Search through every message and collect all tool_calls.
   */
  const allToolCalls: { name: string; args: Record<string, any> }[] = [];
  for (const m of result.messages as any[]) {
    if (m.tool_calls && m.tool_calls.length > 0) {
      for (const tc of m.tool_calls) {
        allToolCalls.push({ name: tc.name, args: tc.args });
      }
    }
  }

  if (allToolCalls.length === 0) {
    console.log("⚠️ No tool calls were captured. Messages:", JSON.stringify(result.messages, null, 2));
  } else {
    console.log(`🔧 Total tool calls captured: ${allToolCalls.length}`);
  }

  // Build tool_arguments map: { toolName: args, ... }
  // If the same tool is called multiple times, suffix with _2, _3, etc.
  const toolArguments: Record<string, any> = {};
  const toolNameCount: Record<string, number> = {};
  for (const tc of allToolCalls) {
    toolNameCount[tc.name] = (toolNameCount[tc.name] || 0) + 1;
    const key = toolNameCount[tc.name] === 1 ? tc.name : `${tc.name}_${toolNameCount[tc.name]}`;
    toolArguments[key] = tc.args;
  }

  return {
    tool_calls: allToolCalls,
    tool_arguments: toolArguments,
    final_output: result.messages[result.messages.length - 1].content,
  };
}
