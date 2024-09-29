declare module 'quill-image-resize-module' {
    import Quill from 'quill';
  
    interface ImageResizeOptions {
      // Add any specific options you want to include
    }
  
    export default class ImageResize {
      constructor(quill: Quill, options?: ImageResizeOptions);
    }
  }
      