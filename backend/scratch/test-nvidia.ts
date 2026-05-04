import * as dotenv from "dotenv";
import path from "path";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function test() {
    console.log("Testing Nvidia Connection...");
    console.log("Key prefix:", process.env.LLAMA_API_KEY?.substring(0, 6));
    
    const llm = new ChatOpenAI({
        apiKey: process.env.LLAMA_API_KEY, // Using the Nvidia key
        model: "deepseek-ai/deepseek-v4-pro",
        configuration: {
            baseURL: "https://integrate.api.nvidia.com/v1",
        },
    });

    try {
        const res = await llm.invoke("Hello, who are you?");
        console.log("Response:", res.content);
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

test();
