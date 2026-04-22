import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Hono } from "hono";
import { agent } from "../config/langgraph-flow";
import { redis } from "../config/caching/redis.config";
import { preprocessQuery } from "../utils/preprocess";
import { SYSTEM_PROMPT } from "../config/prompts";

const app = new Hono();

app.post("/chat/:chatID", async (c) => {
  const startTime = performance.now();
  try {
    const { message } = await c.req.json();
    const chatID = c.req.param("chatID");

    if (!chatID) {
      return c.json(
        {
          message: "ChatID is not found",
        },
        400
      );
    }

    if (!message) {
      return c.json(
        {
          message: "Message should not empty!",
        },
        400
      );
    }

    // Apply preprocessing to the query
    const processedMessage = preprocessQuery(message);

    // ✅ Check if chat history exists (Boolean flag)
    const historyKey = `chat_history_flag:${chatID}`;
    const hasHistory = (await redis.get(historyKey)) === "1";

    // Prepare messages
    let messages = [];
    if (!hasHistory) {
      // If no history, add system message first
      messages.push(new SystemMessage(SYSTEM_PROMPT));

      // ✅ Mark chat as having history (store Boolean flag)
      await redis.set(historyKey, "1");
    }

    messages.push(new HumanMessage(`${processedMessage}`));

    // console.log("Here are the messages recieved: ", messages);
    //invoke agent:
    const response = await agent.invoke(
      {
        messages,
      },
      {
        configurable: {
          thread_id: chatID,
        },
      }
    );



    const finalResponseMessage =
      response.messages[response.messages.length - 1].content;

    const endTime = performance.now();


    return c.json(
      {
        response: finalResponseMessage,
      },
      200
    );
  } catch (error) {
    console.error("Error: ", error);
    return c.json(
      {
        message: "Something went wrong",
      },
      500
    );
  }
});

export default app;
