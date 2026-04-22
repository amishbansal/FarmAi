import { langsmithClient } from "../../mistral-ai"; // Ensure correct import

// ✅ Function to create a new dataset
async function createDataset(): Promise<string> {
  try {
    const dataset = await langsmithClient.createDataset(JSON.stringify({
      name: "Sample Dataset " + Date.now(), // Unique dataset name
      description: "A sample dataset for AI agent evaluation.",
      dataType: "kv",
    }));

    console.log("✅ Dataset created with ID:", dataset.id);
    return dataset.id; // Return dataset ID for further use
  } catch (error) {
    console.error("❌ Error creating dataset:", error);
    throw error;
  }
}

// ✅ Function to add examples to the dataset
async function addExamples(datasetId: string) {
  try {
    const examplePairs: [string, string][] = [
      ["What is the largest mammal?", "The blue whale"],
      ["What is the capital of France?", "Paris"],
      ["Who discovered gravity?", "Isaac Newton"],
      ["What’s the weather like in Delhi?", "Fetching weather data..."], // Example for your AI agent
    ];

    const examples = examplePairs.map(([input, output]) => ({
      dataset_id: datasetId,
      inputs: { question: input },  // Single input object
      outputs: { answer: output },  // Single output object
    }));

    console.log("🔄 Adding examples to dataset:", datasetId);

    // Create examples using the correct API format
    await langsmithClient.createExamples(examples);

    console.log("✅ Examples added successfully!");
  } catch (error) {
    console.error("❌ Error adding examples:", error);
    throw error;
  }
}

// ✅ Main function to create dataset and add examples
export async function setupDatasetAndExamples() {
  try {
    const datasetId = await createDataset(); // Step 1: Create dataset
    await addExamples(datasetId); // Step 2: Add examples
  } catch (error) {
    console.error("❌ Failed to setup dataset and examples:", error);
  }
}

