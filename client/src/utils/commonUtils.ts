export const sanitizeString = (input: string): string => {
    // Step 1: Replace specific special characters
    const specialCharMap: { [key: string]: string } = {
      'ä': 'ae',
      'ö': 'oe',
      'ü': 'ue',
      'ß': 'ss',
      'Ä': 'Ae',
      'Ö': 'Oe',
      'Ü': 'Ue',
    };
  
    // Step 2: Replace special characters from the map
    let sanitized = input.replace(/[^a-zA-Z0-9 ]/g, (char) => specialCharMap[char] || '');
  
    // Step 3: Replace multiple spaces with a single space
    sanitized = sanitized.replace(/\s+/g, ' ');
  
    // Step 4: Trim the string (to remove any leading/trailing spaces)
    sanitized = sanitized.trim();
  
    // Step 5: Replace spaces with hyphens
    sanitized = sanitized.replace(/ /g, '-');
  
    // Step 6: Remove any remaining non-alphanumeric characters except hyphens
    sanitized = sanitized.replace(/[^a-zA-Z0-9-]/g, '');
  
    return sanitized;
  };