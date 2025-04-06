import { getEmbedding } from '../services/embeddingService.js'; 
// import { Client } from 'chromadb';
import { ChromaClient } from 'chromadb';

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
    url: 'http://localhost:8000'  
  });
const collection = chromaClient.getOrCreateCollection('task_embeddings');

// Function to upsert data (add/update) in ChromaDB
async function upsertToChroma(taskId, taskText) {
  try {
    const embedding = await getEmbedding(taskText); // Get embedding using TogetherAI API

    // Upsert task data and embedding to ChromaDB
    const upsertResponse = await collection.add({
      ids: [taskId],
      embeddings: [embedding], 
      metadatas: [{ taskText }],
    }); 

    if (upsertResponse.count > 0) {
      console.log(`Task ${taskId} upserted to ChromaDB.`);
    } else {
      console.log(`❌ Failed to upsert task ${taskId}.`);
    }
  } catch (error) {
    console.error('Error upserting to ChromaDB:', error); 
  }
}

// Delete task from Chroma
async function deleteFromChroma(taskId) {
  try {
    // Attempt to delete the task from ChromaDB by taskId
    const deleteResult = await collection.delete({
      ids: [taskId], // Deleting the task by ID
    });

    if (deleteResult.deleted_count > 0) {
      console.log(`✅ Task ${taskId} successfully deleted from ChromaDB.`);
    } else {
      console.log(`❌ Task ${taskId} not found in ChromaDB.`);
    }
  } catch (error) {
    console.error('❌ Error deleting task from ChromaDB:', error);
  }
}

// Function to search tasks in ChromaDB
async function searchInChroma(query) {
  try {
    const queryEmbedding = await getEmbedding(query); // Get embedding for the query using TogetherAI API
    
    // Perform a search query on the ChromaDB collection
    const results = await collection.query({
      query_embeddings: [queryEmbedding], // Query embeddings to search
      n_results: 5, // Number of top results to fetch
    });

    if (results && results.matches && results.matches.length > 0) {
      console.log(`✅ Found ${results.matches.length} relevant results for query: "${query}"`);
      return results.matches;
    } else {
      console.log(`❌ No relevant results found for query: "${query}"`);
      return [];
    }
  } catch (error) {
    console.error('Error searching in ChromaDB:', error);
    return [];
  }
}

export { upsertToChroma, searchInChroma, deleteFromChroma };
