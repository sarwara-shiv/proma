declare module 'quill-better-table' {
    import Quill from 'quill';
    export interface BetterTableOptions {
      container?: string; // Specify container options here if needed
      // Add any additional options you need
    }
    export default class BetterTable {
      constructor(quill: Quill, options?: BetterTableOptions);
    }
  }
  