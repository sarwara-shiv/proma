import { HfInference } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";
import axios from 'axios';
import 'dotenv/config';

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index("tasks-ai-search");

// Generate embeddings using OpenAI
async function getEmbedding(text) {
  try {
    const inference = new HfInference(process.env.HF_ACCESS_TOKEN);
    const response = await inference.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });
    return response;
  } catch (error) {
    console.error("Error generating embedding:", error);
  }
}

// Upsert (Add/Update) data in Pinecone
async function upsertToPinecone(taskId, taskText) {
  const embedding = await getEmbedding(taskText);

  try {
    await index.upsert([{
      id: taskId,          // MongoDB Task ID
      values: embedding,   // Embedding values
      metadata: { taskText } // Task metadata
    }]);
    console.log("--------------------------------");
    console.log("--------------------------------");
    console.log("--------------------------------");
    console.log(`Task ${taskId} upserted to Pinecone.`);
    console.log("++++++++++++++++++++++++++");
  } catch (error) {
    console.error("Error upserting to Pinecone:", error);
  }
}

// Delete task from Pinecone
async function deleteFromPinecone(taskId) {
  try {
    if (!index) {
      throw new Error("Pinecone index is not initialized.");
    }

    // Corrected delete function: Remove only by ID
    await index.deleteOne(taskId);

    console.log("----------------------------------");
    console.log(`✅ Task ${taskId} deleted from Pinecone.`);
    console.log("----------------------------------");
  } catch (error) {
    console.log("----------------------------------");
    console.log("----------------------------------");
    console.error("❌ Error deleting from Pinecone:", error);
  }
}
// Search tasks in Pinecone
// async function searchInPinecone(query) {
//   try {
//     const queryEmbedding = await getEmbedding(query);
//     if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
//       throw new Error("Invalid embedding returned from Hugging Face.");
//     }

//     const searchResults = await index.query({
//       vector: queryEmbedding[0], // Ensure it's in the correct format
//       topK: 5,
//       includeMetadata: true,
//     });

//     return searchResults.matches;
//   } catch (error) {
//     console.error("Error searching in Pinecone:", error);
//     return [];
//   }
// }

async function searchInPinecone(query) {
  try {
    // Step 1: Extract the relevant keyword dynamically from the query
    // For simplicity, let's assume we are looking for a single keyword from the query.
    // This can be expanded for more sophisticated keyword extraction (e.g., using NLP techniques).
    const keywords = query.toLowerCase().split(' ').filter(Boolean);

    // Step 2: Generate the embedding for the query using Hugging Face
    const queryEmbedding = await getEmbedding(query);

    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      throw new Error("Invalid embedding returned from Hugging Face.");
    }

    // Step 3: Perform the query using Pinecone
    const searchResults = await index.query({
      vector: queryEmbedding, // Full vector for the search query
      topK: 5, // Number of results to return
      includeMetadata: true,  // Include metadata for filtering
    });

    // Step 4: Dynamically filter the results based on the extracted keywords
    const filteredResults = searchResults.matches.filter(match => {
      const taskText = match.metadata.taskText ? match.metadata.taskText.toLowerCase() : '';
      
      // Check if the task text contains any of the extracted keywords
      return keywords.some(keyword => taskText.includes(keyword));
    });

    // Step 5: Return only filtered tasks
    if (filteredResults.length === 0) {
      console.log("❌ No relevant tasks found for the keywords:", keywords);
    } else {
      console.log(`✅ Found ${filteredResults.length} relevant task(s) for the keywords:`, keywords);
    }

    return filteredResults;
  } catch (error) {
    console.error("❌ Error searching in Pinecone:", error);
    return [];
  }
}



export { upsertToPinecone, deleteFromPinecone, searchInPinecone };
