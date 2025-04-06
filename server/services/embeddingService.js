// server/embeddingService.js
import 'dotenv/config'; // Import environment variables
import Together from "together-ai";
const together = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
});

// Function to get embedding from TogetherAI
async function getEmbedding(text) {
  try {
    const response = await together.chat.completions.create({
      model: 'text-embedding-model', // Specify the model you want to use
      messages: [
        {
          role: 'system',
          content: 'Generate an embedding for the following text:',
        },
        {
          role: 'user',
          content: text, // The text for which embedding is requested
        },
      ],
    });

    // Assuming the response contains the embedding in `choices[0].message.embedding`
    return response.choices[0].message.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to get embedding from TogetherAI');
  }
}

export { getEmbedding };
