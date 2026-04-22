import { AIMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";

export function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If an error fallback message was generated, force an exit
  if (lastMessage.additional_kwargs?.is_fallback) {
    return "__end__";
  }

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // Otherwise, we stop (reply to the user) using the special "__end__" node
  return "__end__";
}