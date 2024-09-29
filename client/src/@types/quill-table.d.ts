declare module 'quill-table' {
    import Quill from 'quill';
  
    export interface QuillTableOptions {
      // Define any options that quill-table accepts
    }
  
    export default class QuillTable {
      constructor(quill: Quill, options?: QuillTableOptions);
    }
  }
  