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
    <div className="absolute bg-white border border-gray-300 shadow-lg mt-2 z-10">
      <ul>
        {users.map(user => (
          <li
            key={user._id}
            className="p-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => {
              onSelect(user);
              onClose();
            }}
          >
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearchPopup;
