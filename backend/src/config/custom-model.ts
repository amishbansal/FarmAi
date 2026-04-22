// nvidiaLLM.ts
import { RunnableLambda } from "@langchain/core/runnables";
import OpenAI from "openai";

const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY!,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export const nvidiaLLM = new RunnableLambda({
  func: async (input: string) => {
    const chatCompletion = await nvidia.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-70b-instruct",
      messages: [{ role: "user", content: input }],
      temperature: 0.5,
      max_tokens: 1024,
    });

    return chatCompletion.choices[0].message.content;
  },
});
