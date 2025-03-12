import React, { useState, useRef, useEffect } from 'react';

interface ArgsType {
  name?: string;
  label?: string;
  defaultValue?: string;
  height?:string;
  maxHeight?:string;
  textSize?:'xs' | 'sm' 
  onChange: (name: string, value: string) => void;
}

const isImageUrl = (url: string) => {
  return /\.(jpeg|jpg|gif|png|svg|webp)$/.test(url);
};

const RichTextArea: React.FC<ArgsType> = ({ textSize='sm', name = "", label = "", defaultValue = '', onChange, height='150', maxHeight }) => {
  const [value, setValue] = useState<string>(defaultValue);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);

  // Handle input changes
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = (e.target as HTMLDivElement).innerHTML;
    setValue(newValue);
    if (onChange) {
      onChange(name, newValue);
    }
  };

  // Store the cursor position
  const storeSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0);
    }
  };

  // Restore the cursor position
  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selection && selectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    }
  };

  // Apply bold style using Range and Selection APIs
  const applyBold = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // If no text is selected, do nothing

    const strong = document.createElement('strong');
    strong.appendChild(range.extractContents());
    range.insertNode(strong);

    setValue(contentEditableRef.current?.innerHTML || '');
  };


  // Convert URLs to clickable links, but ignore image URLs
  const autoLinkURLs = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, (url) => {
      if (isImageUrl(url)) {
        return url; // Don't make image URLs clickable
      }

      // Make non-image URLs clickable
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`; 
    });
  };   

  // Effect to update innerHTML and restore cursor position
  useEffect(() => {
    if (contentEditableRef.current) {
      const currentContent = contentEditableRef.current.innerHTML;

      // Update the innerHTML only if the content is different
      if (currentContent !== value) {
        contentEditableRef.current.innerHTML = autoLinkURLs(value);
        restoreSelection(); // Restore cursor position after updating
      }
    }
  }, [value]); 
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]); 

  useEffect(() => {
    if (contentEditableRef.current) {
      const currentContent = contentEditableRef.current.innerHTML;

      // Update the innerHTML only if the content is different
      if (currentContent !== value) {
        contentEditableRef.current.innerHTML = autoLinkURLs(value);
        restoreSelection(); // Restore cursor position after updating
      }
    }
  }, []);

  return (
    <div>
      {label && <label className="text-gray-400 flex items-center text-sm">{label}</label>}
      <div
        ref={contentEditableRef}
        contentEditable
        onInput={handleInput}
        onFocus={storeSelection} // Store the selection when focused
        onKeyUp={storeSelection} // Store the selection on keyup
        className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:shadow-lg  bg-white
          min-h-[${height}px] 
          ${maxHeight ? `max-h-[${maxHeight}px]` : ""}
          relative text-${textSize} text-slate-800`}
        style={{ whiteSpace: 'pre-wrap', overflowY: 'auto' }} // Keep formatting
        suppressContentEditableWarning // Prevent React warning
      />
    </div>
  );
};

export default RichTextArea;
