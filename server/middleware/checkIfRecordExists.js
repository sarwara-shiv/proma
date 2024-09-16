// Helper function to check for existing records by fields
const checkIfRecordExists = async (model, checkDataBy, data, id = null) => {
    try {
      // Initialize an object to keep track of which fields have existing records
      const result = {};
  
      if (Array.isArray(checkDataBy) && checkDataBy.length > 0) {
        // Iterate over each key in checkDataBy
        for (const key of checkDataBy) {
          // Retrieve the value from the data object for the current key
          const value = data[key];
  
          // If the value is defined, perform the query
          if (value !== undefined) {
            const query = { [key]: value };
  
            // Check if a record exists with the current field value
            const existingRecord = await model.findOne(query);
  
            // Update the result object based on whether a record was found and ID check
            if (existingRecord) {
              if (!id || (id && existingRecord.id !== id)) {
                result[key] = true; // Record exists and either no id or conflicting id
              }
            } else {
              result[key] = false; // No existing record for this key
            }
          } else {
            // If no value for this key in data, indicate no match
            result[key] = false;
          }
        }
      }
  
      // Return the result object, indicating which fields have existing records
      return result;
    } catch (error) {
      // Log the error and throw a more descriptive error message
      console.error('Error checking for existing records:', error);
      throw new Error('Error checking for existing records');
    }
  };

  export { checkIfRecordExists };