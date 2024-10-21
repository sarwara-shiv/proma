// Import the ChangeLog model using ES6 syntax
import { ChangeLog } from '../models/models.js';

/**
 * TODO
 * get only key value pair which has been changed
 * currently giving all the key value pair
 * implement deep compare 
 * 
 */

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
    if (oldValue !== newValue) {
      changes.push({
        field,
        oldValue: oldValue !== undefined ? oldValue : null, // Use null if oldValue is undefined
        newValue: newValue !== undefined ? newValue : null, // Use null if newValue is undefined
      });
    }
  });

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


const deepEqual = (value1, value2) => {
    // Check for strict equality
    if (value1 === value2) return true;
  
    // Check for null or type differences
    if (value1 == null || value2 == null || typeof value1 !== typeof value2) return false;
  
    // Handle array comparison
    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length !== value2.length) return false; // Different lengths
      return value1.every((val, index) => deepEqual(val, value2[index])); // Compare each element
    }
  
    // Handle object comparison
    if (typeof value1 === 'object' && typeof value2 === 'object') {
      const keys1 = Object.keys(value1);
      const keys2 = Object.keys(value2);
      
      if (keys1.length !== keys2.length) return false; // Different number of keys
  
      // Check each key in the first object
      return keys1.every(key => {
        if (!keys2.includes(key)) return false; // Key not in second object
        return deepEqual(value1[key], value2[key]); // Recursively compare values
      });
    }
  
    return false; // Values are different types or otherwise not equal
  };
