import { calculateSimilarity } from "../../../utils/helpers";
import { systemicClean, ENTITY_FIELDS } from "../../../utils/preprocess";

/**
 * Tool Accuracy Evaluator (Binary Scoring)
 * 
 * Score = 1 ONLY if:
 * 1. All expected tools are called.
 * 2. No extra tools are called.
 * 3. All arguments match above the similarity threshold (70%).
 * 
 * Score = 0 otherwise.
 */
export const toolAccuracyEvaluator = async ({
    run,
    example,
}: {
    run: any;
    example?: any;
}) => {
    const predicted = run.outputs?.tool_arguments || {};
    const expected = example?.outputs?.tool_arguments || {};

    // Collect tools into arrays of { name, args }
    const predictedEntries = Object.entries(predicted).map(([key, args]: [string, any]) => ({
        name: key.replace(/_\d+$/, ""), // strip suffix like _2, _3
        args: args || {},
    }));

    const expectedEntries = Object.entries(expected).map(([key, args]: [string, any]) => ({
        name: key.replace(/_\d+$/, ""),
        args: args || {},
    }));

    console.log(`📏 Evaluator - Predicted tools: \${predictedEntries.map(e => e.name).join(", ") || "NONE"}`);
    console.log(`📏 Evaluator - Expected  tools: \${expectedEntries.map(e => e.name).join(", ") || "NONE"}`);

    // Base case: No tools expected
    if (expectedEntries.length === 0) {
        const score = predictedEntries.length === 0 ? 1 : 0;
        return { key: "tool_accuracy", score };
    }

    // Count must match exactly for a perfect trajectory
    if (predictedEntries.length !== expectedEntries.length) {
        console.log(`📏 Evaluator - FAILED: Tool count mismatch. Expected \${expectedEntries.length}, Got \${predictedEntries.length}`);
        return { key: "tool_accuracy", score: 0 };
    }

    const usedPredictedIndices = new Set<number>();
    let matchCount = 0;

    for (const exp of expectedEntries) {
        let matchedInLoop = false;
        for (let i = 0; i < predictedEntries.length; i++) {
            if (usedPredictedIndices.has(i)) continue;
            const pred = predictedEntries[i];

            if (pred.name !== exp.name) continue;

            // Only compare keys that exist in BOTH predicted and expected (common keys)
            const expectedKeys = Object.keys(exp.args);
            const commonKeys = expectedKeys.filter(key => key in pred.args);
            let allArgsMatch = true;

            if (commonKeys.length === 0 && expectedKeys.length > 0) {
                // No common keys at all — agent called the right tool with completely wrong args
                allArgsMatch = false;
                console.log(`📏 Evaluator - FAILED: No common arg keys between predicted and expected.`);
            }

            for (const key of commonKeys) {
                let pVal = String(pred.args[key] || "").toLowerCase();
                let eVal = String(exp.args[key] || "").toLowerCase();

                if (ENTITY_FIELDS.has(key) || key === "query") {
                    pVal = systemicClean(pVal, true);
                    eVal = systemicClean(eVal, true);
                }

                const similarity = calculateSimilarity(pVal, eVal);

                if (similarity < 0.6) {
                    allArgsMatch = false;
                    console.log(`📏 Evaluator - Arg [${key}] FAILED: "${pVal}" vs "${eVal}" | Sim: ${(similarity * 100).toFixed(1)}%`);
                    break;
                }
                console.log(`📏 Evaluator - Arg [${key}] PASSED: "${pVal}" vs "${eVal}" | Sim: ${(similarity * 100).toFixed(1)}%`);
            }

            if (allArgsMatch) {
                usedPredictedIndices.add(i);
                matchCount++;
                matchedInLoop = true;
                console.log(`📏 Evaluator - Tool [\${exp.name}] matched.`);
                break;
            }
        }
        if (!matchedInLoop) {
            console.log(`📏 Evaluator - FAILED: Could not find match for expected tool [\${exp.name}]`);
            break;
        }
    }

    const score = matchCount === expectedEntries.length ? 1 : 0;
    console.log(`📏 Evaluator - Results: \${matchCount}/\${expectedEntries.length} matched. Final Binary Score: \${score}`);

    return {
        key: "tool_accuracy",
        score,
    };
};
