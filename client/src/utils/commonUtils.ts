import { IDefaultRoles, UserRole } from "@/interfaces";

export const getRole = (roles:UserRole[], role:IDefaultRoles | null = null)=>{
  if(roles && !role){
    if (roles.some(role => role.name === 'admin')) {
      return 'admin';
    } else if (roles.some(role => role.name === 'manager')) {
      return 'manager';
    } else {
      return 'other'; // fallback to "other"
    }
  }
  return false;
}


export const trimHtmlContent = (htmlContent:string) => {
  // Create a temporary div to parse the HTML string
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Get the text content and trim it
  const trimmedText = tempDiv.textContent?.trim() || '';

  // Update the HTML content with trimmed text, keeping the structure
  return trimmedText;
};


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

/**
 * Recursively extracts all `_id` values from a task/subtask structure.
 * 
 * @param collection - The Collection object that may contain nested subtasks
 * @returns An array of all `_id` values found in the task/subtasks structure
 */
  export const extractRecursiveIds = (collection: any, field:string): string[] => {
    let ids: string[] = [];
    console.log(collection)
    // Check if the current object has an _id and add it to the ids array
    if (collection._id) {
      ids.push(collection._id);
    }
  
    // If the current object has subtasks, recursively extract IDs from each subtask
    if (collection[field] && Array.isArray(collection[field])) {
      collection[field].forEach((nestedSubtask: any) => {
        ids = [...ids, ...extractRecursiveIds(nestedSubtask, field)];
      });
    }

  
    return ids;
};
  
