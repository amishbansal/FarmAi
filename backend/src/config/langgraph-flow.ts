import {
  Annotation,
  MemorySaver,
  MessagesAnnotation,
  messagesStateReducer,
  StateGraph,
} from "@langchain/langgraph";
import { callModel } from "./mistral-ai";
import { toolNode } from "./tools/tools";
import { shouldContinue } from "./tools/should-continue";
import { BaseMessage } from "@langchain/core/messages";

const memory = new MemorySaver();

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

export const agent = workflow.compile({
  checkpointer: memory,
});
