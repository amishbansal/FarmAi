import { Hono } from "hono";
import { evaluate } from "langsmith/evaluation";
import {
  singleaccuracy,
  targetSingleStep,
} from "../config/evaluation/evaluators/single-step";
import { accuracy, target } from "../config/evaluation/evaluators/evaluator";
import {
  finalAnswerTarget,
  finalResponseAccuracy,
} from "../config/evaluation/evaluators/final-answer-evaluation";
import { visionLLM } from "../config/mistral-ai";

const app = new Hono();

const delayFunction = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

app.get("/test", async (c) => {
  console.log("Test endpoint hit");
  try {
    const startTime = performance.now();

    // const cacheKey = `Brinjal:Gujarat`;
    // const cachedData = await redis.get(cacheKey);

    // if (cachedData) {
    //     console.log("Returning cached mandi data");
    //   const endTime = performance.now();
    //   const totalTIme = endTime - startTime;
    //   console.log(`Database exec time took ${totalTIme.toFixed(2)} ms`);

    //   return c.json(
    //     {
    //       success: true,
    //       data: totalTIme,
    //     },
    //     200
    //   );
    // }

    //
    try {
      await evaluate(
        (exampleInput) => {
          console.log("Example Input: ", exampleInput.question);

          // Delays will be added here to simulate time taken and to get rid of rate limit

          return targetSingleStep(exampleInput.question);
          // return finalAnswerTarget(exampleInput.question);
          // return target(exampleInput.question);
        },
        {
          data: "test-single-step-2",
          evaluators: [
            // accuracy,
            singleaccuracy,
            // finalResponseAccuracy,
            // can add multiple evaluators here
          ],
          experimentPrefix: "eval-in-langsmith",
          maxConcurrency: 1,
        }
      );
    } catch (error) {
      console.error("Error during evaluation: ", error);
      return c.json(
        {
          message: "Evaluation failed",
        },
        500
      );
    }

    return c.json(
      {
        success: true,
        message: "Evaluation completed successfully",
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

app.post("/test-llm", async (c) => {
  try {
    const { question } = await c.req.json();
    console.log("Question: ", question);

    const response = await visionLLM.invoke([
      {
        role: "user",
        content: question,
      },
    ]);
    console.log("Response from LLM:", response);
    return c.json(
      {
        success: true,
        data: response,
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
