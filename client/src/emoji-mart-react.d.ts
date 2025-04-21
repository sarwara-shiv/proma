declare module '@emoji-mart/react' {
    import * as React from 'react';
  
    interface PickerProps {
      data: any;
      onEmojiSelect: (emoji: any) => void;
      theme?: 'light' | 'dark' | 'auto';
      previewPosition?: 'top' | 'bottom' | 'none';
      // Add other props as needed
    }
  
    const Picker: React.FC<PickerProps>;
  
    export default Picker;
  }
  