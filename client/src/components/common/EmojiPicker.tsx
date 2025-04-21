import React, { useRef, useEffect } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { BsEmojiSmile } from 'react-icons/bs';

interface EmojiPickerComponentProps {
  editorRef: React.RefObject<HTMLDivElement>;
  showEmojiPicker: boolean;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
}

const EmojiPicker: React.FC<EmojiPickerComponentProps> = ({
  editorRef,
  showEmojiPicker,
  setShowEmojiPicker,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  // Function to insert emoji at the cursor position
  const addEmoji = (emoji: any) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Focus the editor
    editor.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    // Create a text node with the emoji
    const emojiNode = document.createTextNode(emoji.native);
    range.insertNode(emojiNode);

    // Move the cursor after the inserted emoji
    range.setStartAfter(emojiNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    // Optionally, close the emoji picker after selection
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside, but not when clicking on the picker or an emoji
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker, setShowEmojiPicker]);

  // Stop propagation when clicking on an emoji to prevent closing the picker
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button className="flex justify-center items-center aspect-1/1 text-lg hover:text-primary " onClick={() => setShowEmojiPicker((prev) => !prev)}><BsEmojiSmile/></button>
      {showEmojiPicker && (
        <div
          className="absolute bottom-full mb-2 z-50"
          onClick={stopPropagation} // Prevent outside click when clicking inside picker
        >
          <Picker data={data} onEmojiSelect={addEmoji} />
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
