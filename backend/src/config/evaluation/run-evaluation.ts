import * as path from "path";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load .env explicitly from the workspace root
const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

console.log("🔍 LangSmith Config:");
console.log("PROJECT:", process.env.LANGCHAIN_PROJECT);
console.log("API_KEY:", process.env.LANGCHAIN_API_KEY ? "✅ LOADED" : "❌ MISSING");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ LOADED" : "❌ MISSING");

if (!process.env.LANGCHAIN_API_KEY) {
    console.error("❌ LANGCHAIN_API_KEY is missing. Tracing will not work.");
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";   // To ignore SSL certificate errors, not recommended for production, only used for evaluation scripts

import { evaluate } from "langsmith/evaluation";
import { runAgent } from "../runAgent";
import { toolAccuracyEvaluator } from "./evaluators/tool-accuracy";
import MongoDB from "../db/mongodb";

const DATASET_NAME = "Filtered"; // Ensure this matches your LangSmith dashboard, name of the dataset we put in langsmith

// Helper to sleep/delay execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is missing. Agent will fail to connect to DB.");
        return;
    }

    console.log("🗄️ Connecting to MongoDB...");
    await MongoDB.connect();

    const evaluationResults: any[] = [];

    try {
        console.log(`🚀 Starting evaluation on dataset: ${DATASET_NAME}`);

        // 1. Run the evaluation
        const results = await evaluate(
            async (inputs: any) => {
                // Find question in inputs
                const question = inputs.question ?? inputs.input ?? inputs.query ?? inputs.text;

                if (!question) {
                    console.warn("⚠️ Skipping item: No question found in inputs:", JSON.stringify(inputs, null, 2));
                    return { skipped: true };
                }

                console.log(`🤖 Running Agent for question: "${question}"`);
                const agentResult = await runAgent(question);

                // Add a delay to stay within DeepSeek/LLM rate limits (429 protection)
                console.log("⏳ Throttling: sleeping for 8 seconds...");
                await sleep(8000);

                // Return structured output for LangSmith evaluation
                return {
                    tool_arguments: agentResult.tool_arguments,
                };
            },
            {
                data: DATASET_NAME,
                evaluators: [toolAccuracyEvaluator],
                experimentPrefix: "tool-eval",
                maxConcurrency: 1,
            }
        );

        console.log("✅ Evaluation traces submitted.");

    } catch (error) {
        console.error("❌ Evaluation process failed:", error);
    } finally {
        console.log("🔌 Disconnecting MongoDB...");
        await MongoDB.disconnect();
        process.exit(0);
    }
}

main();
