import { Counter } from "../models/models.js";

/**
 * Generates a unique ID for a given collection with a prefix.
 * @param {string} collectionName - The name of the collection (e.g., "project", "task", "question").
 * @param {string} prefix - The prefix to add to the generated ID (e.g., "P", "T", "Q").
 * @returns {Promise<string>} - The generated unique ID.
 */

const getPrefix = (resource) => {
    switch (resource) {
      case 'projects':
        return 'PR';
      case 'tasks':
        return 'TA';
      case 'roles':
        return 'RO';
      case 'auth':
        return 'US';
      case 'users':
        return 'US';
      case 'groups':
        return 'UG'; 
      case 'documentation':
        return 'DO';
      default:
        return null;
    }
};

const generateUniqueId = async (resource, prefix) => {
  try {
    const counter = await Counter.findByIdAndUpdate(
        resource,
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      throw new Error(`Failed to update counter for ${resource}`);
    }
    const prefix = getPrefix(resource); 
    // Return the unique ID with the prefix (e.g., "P1001", "T1002", "Q1003")
    return `${prefix}${counter.sequence_value}`;
  } catch (error) {
    console.error('Error generating unique ID:', error);
    throw error;
  }
};

export { generateUniqueId };
