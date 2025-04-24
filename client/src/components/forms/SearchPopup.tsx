// UserSearchPopup.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../interfaces';
import axios from 'axios';
import { searchByName } from '../../hooks/dbHooks';
import ReactDOM from 'react-dom';


interface ArgsType {
  query: string;
  type: 'users'|'tasks'|'projects'
//   type: 'users'|'tasks'|'projects'|'projectTasks'|'userTasks'|'projectUserTasks'
  projectId?:string;
  userId?:string;
  role?:"user"|"client"
  onSelect: (user: User) => void;
  onClose: () => void;
}

const SearchPopup: React.FC<ArgsType> = ({ query, onSelect, onClose, type="users",role="user", projectId, userId }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    console.log('---- query ',query); 
    console.log('---- type ',type); 
    if (query) {
        searchByName({query, type:type}).then((response)=>{
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
    <div className="relative bg-white border border-gray-300 shadow-lg  p-2 z-10 top-0 min-h-2"> 
      <ul className="text-sm">
        {users.map((user) => (
          <li
            key={user._id}
            className="px-2 py-1 text-xs hover:bg-green-100 cursor-pointer text-slate-400 font-normal border-b-1 border-slate-400 hover:text-slate-800"
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
    )
};

export default SearchPopup;
