// Helper function to check for existing records by fields
const checkIfRecordExists = async (model, checkDataBy, data, id = null) => {
    try {
      // Initialize an object to keep track of which fields have existing records
      const result = {};
  
      if (Array.isArray(checkDataBy) && checkDataBy.length > 0) {
        for (const key of checkDataBy) {
          const value = data[key];
          if (value !== undefined) {
            const query = { [key]: value };
            const existingRecord = await model.findOne(query);
            if (existingRecord) {
              if (!id || (id && existingRecord.id !== id)) {
                result[key] = true; 
              }
            } else {
              // result[key] = false; 
            }
          } else {
            // If no value for this key in data, indicate no match
            //result[key] = false;
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