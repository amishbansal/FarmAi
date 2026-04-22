import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { agent } from "../config/langgraph-flow";
import { redis } from "../config/caching/redis.config";
import { normalizeChunk } from "../utils/helpers";
import { getConnInfo } from "hono/bun";

const app = new Hono();

app.post("/chat-stream/:chatID", (c) => {
  const info = getConnInfo(c);
  return streamText(c, async (stream) => {


    const chatID = c.req.param("chatID");

    try {
      if (!chatID) {
        await stream.writeln("ChatID is not found");
        return;
      }

      const body = await c.req.json();
      const message = body.message;
      const images = body.images;

      if (!message) {
        await stream.writeln("Message should not be empty!");
        return;
      }

      // ✅ Check if chat history exists (Boolean flag)
      const historyKey = `chat_history_flag:${chatID}`;
      const hasHistory = (await redis.get(historyKey)) === "1";

      // Prepare messages
      let messages = [];

      // ✅ Mark chat as having history (store Boolean flag)
      if (!hasHistory) {
        await redis.set(historyKey, "1");
      }

      messages.push(
        new HumanMessage({
          content:
            message +
            ` | Here is user's IP Address only if you need to fetch user's location: ${info.remote.address}`, // Text message content
          additional_kwargs: images ? { images } : {}, // Store images properly
        })
      );

      // console.log("Here are the messages recieved: ", messages);

      for await (const chunk of agent.streamEvents(
        {
          messages: messages,
        },
        {
          version: "v2",
          configurable: {
            thread_id: chatID || Math.floor(Math.random() * 100) + 1,
          },
          recursionLimit: 5, // Prevent infinite tool loops that drain quota
        }
      )) {
        if (chunk.event === "on_chat_model_stream") {
          const content = chunk.data?.chunk?.content;
          if (content) {
            await stream.write(normalizeChunk(content));
          }
        }
      }

      // for await (const chunk of streamResponse) {
      //   // console.log("📝 Streaming chunk:", chunk?.agent?.messages[0]?.content);
      //   const content = chunk?.agent?.messages[0]?.content || "";
      //   await stream.writeln(content);
      //   // if (content) {
      //   //   await stream.writeln(content);
      //   // }
      // }

      // console.log("✅ Streaming finished.");
    } catch (error) {
      console.error("❌ Streaming error:", error);
      await stream.writeln(
        "Something went wrong while processing your request. Please try again or open a new chat."
      );
    }
  });
});

export default app;
