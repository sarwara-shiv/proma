// MentionInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import UserSearchPopup from './UserSearchPopup';
import { User } from '../../interfaces';

interface ArgsType{
  type?: 'text' | 'textarea';
}

const MentionUserInput: React.FC<ArgsType> = ({type="textarea"}) => {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const inputRef = useRef<HTMLInputElement >(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const match = text.match(/@\w*$/);
    if (match) {
      setQuery(match[0].slice(1)); 
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectUser = (user: User) => {
    const newText = text.replace(/@\w*$/, `@${user.username}`);
    setText(newText);
  };

  return (
    <div className="relative">
      {type === 'text' &&  
        <input
          type='text'
          ref={inputRef}
          value={text}
          onChange={handleChange}
          className="w-full h-10 p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-none focus:border-gray-300"
        />
      }
      {type === 'textarea' &&  
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-none focus:border-gray-300 "
          rows={4}
        />
      }
      {showPopup && (
        <UserSearchPopup
          query={query}
          onSelect={handleSelectUser}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default MentionUserInput;
