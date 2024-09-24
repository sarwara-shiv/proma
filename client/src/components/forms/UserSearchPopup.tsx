// UserSearchPopup.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../interfaces';
import axios from 'axios';
import { searchUserByUsername } from '../../hooks/dbHooks';

interface UserSearchPopupProps {
  query: string;
  onSelect: (user: User) => void;
  onClose: () => void;
}

const UserSearchPopup: React.FC<UserSearchPopupProps> = ({ query, onSelect, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (query) {
        searchUserByUsername({query}).then((response)=>{
           if(response.status === 'success'){
            setUsers(response.data);
           }
        }).catch(error=>{
            console.log(error);
        })
    } else {
      setUsers([]);
    }
  }, [query]);

  return (
    <div className="absolute bg-white border border-gray-300 shadow-lg mt-2 z-10 top-[1.5rem]">
      <ul className='text-sm'>
        {users.map(user => (
          <li
            key={user._id}
            className="px-2 py-1 text-xs  hover:bg-green-100 cursor-pointer text-slate-400 font-normal border-b-1 border-slate-400 hover:text-slate-800"
            onClick={() => {
              onSelect(user);
              onClose();
            }}
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearchPopup;
