// MentionInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import UserSearchPopup from './UserSearchPopup';
import { User } from '../../interfaces';

interface ArgsType{
  inputType?: 'text' | 'textarea';
  data?:any;
  type?:"text" | "users";
  initialValues?:string | User[];
  onClick?:(user:User, data:any)=>void;
}

const MentionUserInput: React.FC<ArgsType> = ({inputType="textarea", type="text", data, onClick}) => {
  const [text, setText] = useState(type==='users' ? '@' : '');
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
    const {value} = e.target;
    if(type === 'users'){
      if(value.startsWith('@')) setText(value);
    }else{
      setText(e.target.value);
    }
  };

  const pattern = type === 'users' ? `^@` : '';

  const handleSelectUser = (user: User) => {
    const newText = text.replace(/@\w*$/, `@${user.username}`);
    if(type === 'users'){
      setText('@');
    }else{
      setText('');
    }
    onClick && onClick(user, data);
  };

  return (
    <div className="relative">
      {inputType === 'text' &&  
        <input
          type='text'
          ref={inputRef}
          value={text}
          onChange={handleChange}
          {...pattern ? {pattern} : {}}
          className="
w-full bg-gray-50 border text-gray-900 text-sm rounded-sm focus:outline-none block p-2.5 pr-10 dark:bg-gray-700          "
        />
      }
      {inputType === 'textarea' &&  
        <textarea
          ref={textareaRef}
          value={text}
          {...pattern ? {pattern} : {}}
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
