// MentionInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import UserSearchPopup from './UserSearchPopup';
import { User } from '../../interfaces';

const MentionUserInput: React.FC = () => {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const match = text.match(/@\w*$/);
    if (match) {
      setQuery(match[0].slice(1)); 
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSelectUser = (user: User) => {
    const newText = text.replace(/@\w*$/, `@${user.username}`);
    setText(newText);
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={text}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded"
        rows={5}
      />
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
