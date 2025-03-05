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
      case 'qatasks':
        return 'QA';
      case 'maintasks':
        return 'MT';
      case 'roles':
        return 'RO';
      case 'auth':
        return 'US';
      case 'users':
        return 'US';
      case 'groups':
        return 'UG'; 
      case 'worklogs':
        return 'WL'; 
      case 'dailyreports':
        return 'DR'; 
      case 'documentation':
        return 'DO';
      default:
        return null;
    }
};

const generateUniqueId = async (resource, prefix) => {
  try {
    const counter = await Counter.findByIdAndUpdate(
        resource === 'auth' ? 'users' : resource,
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      throw new Error(`Failed to update counter for ${resource}`);
    }
    const prefix = getPrefix(resource); 
    if (prefix) return `${prefix}${counter.sequence_value}`;
    else return null;
  } catch (error) {
    console.error('Error generating unique ID:', error);
    throw error;
  }
};

export { generateUniqueId };
