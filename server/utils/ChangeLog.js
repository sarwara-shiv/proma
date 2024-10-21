// Import the ChangeLog model using ES6 syntax
import { ChangeLog } from '../models/models.js';

// Utility function to deeply compare two values
const deepEqual = (value1, value2) => {
  if (value1 === value2) {
    return true; // Same reference or same primitive value
  }

  if (typeof value1 !== typeof value2) {
    return false; // Different types
  }

  if (Array.isArray(value1) && Array.isArray(value2)) {
    // Compare arrays
    if (value1.length !== value2.length) {
      return false;
    }
    return value1.every((val, index) => deepEqual(val, value2[index]));
  }

  if (typeof value1 === 'object' && typeof value2 === 'object') {
    // Compare objects
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    return keys1.every(key => deepEqual(value1[key], value2[key]));
  }

  return false; // For other types (e.g., functions)
};

// Utility function to log changes
export const logChanges = async (collectionName, documentId, originalDoc, updatedDoc, userId) => {
  const changes = [];

  // Create a combined set of all fields to compare
  const allFields = new Set([...Object.keys(originalDoc), ...Object.keys(updatedDoc)]);

  // Compare original and updated documents field by field
  allFields.forEach(field => {
    const oldValue = originalDoc[field];
    const newValue = updatedDoc[field];

    // Only log the change if the value is different
    if (!deepEqual(oldValue, newValue)) {
      changes.push({
        field,
        oldValue: oldValue !== undefined ? oldValue : null, // Use null if oldValue is undefined
        newValue: newValue !== undefined ? newValue : null, // Use null if newValue is undefined
      });
    }
  });

  console.log('-------------------------');
  console.log(changes);

  // Create a log entry only if there are changes
  if (changes.length > 0) {
    const logEntry = new ChangeLog({
      collectionName,
      documentId,
      changedBy: userId,
      changes: changes, // Store only the changed fields
    });

    try {
      // Save the change log
      await logEntry.save();
    } catch (error) {
      console.error('Error saving change log:', error);
      throw error; // Re-throw or handle the error as appropriate
    }
  }
};
