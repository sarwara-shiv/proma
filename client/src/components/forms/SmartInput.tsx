import React, { useState, useEffect, useRef } from 'react';
import SearchPopup from './SearchPopup';
import { User, Task, Project } from '../../interfaces';
import CustomSmallButton from '../common/CustomSmallButton';
import { IoMdSearch } from 'react-icons/io';

interface ArgsType {
  inputType?: 'text' | 'textarea';
  data?: any;
  initialValues?: string | User[] | Task[] | Project[];
  onClick?: (text:string, parsedText:string) => void;
  onButtonClick?: (text:string, parsedText:string) => void;
}

const SmartInput: React.FC<ArgsType> = ({
  inputType = 'textarea',
  data,
  onClick,
  onButtonClick
}) => {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [resource, setResource] = useState<'users' | 'tasks' | 'projects' | ''>('');
  const [showPopup, setShowPopup] = useState(false);
  const [parsedText, setParsedText] = useState<string>('');
  const [popupData, setPopupData] = useState<User[] | Task[] | Project[]>([]);
  const [searchData, setSearchData] = useState<{query:string, type:'users'|'tasks'|'projects'}>({query:'', type:'users'});
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Regular expression to match the format: @resource <query>
    const match = text.match(/@(\w+)\s*<([\w\s]+)>/);
    if (match) {
      const [, matchedResource, matchedQuery] = match;

      // Validate matchedResource to be one of the allowed values
      if (['users', 'tasks', 'projects'].includes(matchedResource)) {
        setResource(matchedResource as 'users' | 'tasks' | 'projects');
        setQuery(matchedQuery.trim());
        setShowPopup(true);

        // Dynamically fetch data based on the matched resource
        if (matchedResource.trim() === 'users') {
          fetchUsers(matchedQuery.trim());
        } else if (matchedResource.trim() === 'tasks') {
          fetchTasks(matchedQuery.trim());
        } else if (matchedResource.trim() === 'projects') {
          fetchProjects(matchedQuery.trim());
        }
      } else {
        setShowPopup(false); // If resource is not valid, hide the popup
      }
    } else {
      setShowPopup(false); // Hide the popup if no match is found
    }
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setText(value);
    setParsedText(value);
  };

  const fetchUsers = async (query: string) => {
    // Replace with actual API call to fetch users based on the query
    const users: User[] = []; // Mock data for users based on query
    console.log(query);
    setPopupData(users);
    setSearchData({...searchData, query, type:'users'})
  };

  const fetchTasks = async (query: string) => {
    // Replace with actual API call to fetch tasks based on the query
    const tasks: Task[] = []; // Mock data for tasks based on query
    setPopupData(tasks);
    setSearchData({...searchData, query, type:'tasks'})
  };

  const fetchProjects = async (query: string) => {
    // Replace with actual API call to fetch projects based on the query
    const projects: Project[] = []; // Mock data for projects based on query
    setPopupData(projects);
    setSearchData({...searchData, query, type:'projects'})
  };

  const handleSelectItem = (item: User | Task | Project) => {
    const displayName = item.name ? item.name : '';
    const id = item._id || item._id; // assuming item has either _id or id
    const cid = item._cid || item._cid; // assuming item has either _id or id
    // Create a version for parsedText with resource and ID
    console.log('-----',text);
    const newParsedText = text.replace(/@(\w+)\s*<[\w\s]+>/, `${resource.slice(0, -1)}  **${displayName} (${cid})**`);

    // Replace with just the name for display
    const newText = text.replace(/@(\w+)\s*<[\w\s]+>/, `${resource.slice(0, -1)} **${displayName} :(${cid})**`);
  
    setText(newText); // user sees this
    setParsedText(newParsedText); // internal processing
  
    onClick && onClick(newText, parsedText);
    setShowPopup(false);
    
    console.log(newParsedText);
  };

  
  

  return (
    <div className="relative">
      <div>
        {inputType === 'text' && (
          <input
            type="text"
            ref={inputRef}
            value={text}
            onChange={handleChange}
            className="w-full bg-gray-50 border text-gray-900 text-sm rounded-sm focus:outline-none block p-2.5 pr-10 dark:bg-gray-700 pr-10"
          />
        )}
        {inputType === 'textarea' && (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-none focus:border-gray-300 pr-10"
            rows={4}
          />
        )}
      </div>
      <div className='absolute top-1 right-1'>
        <CustomSmallButton type='search'  icon={<IoMdSearch/>} onClick={()=>{onButtonClick && onButtonClick(text, parsedText)}}/>
      </div>

      {showPopup && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 -mb-2 rounded-md shadow-lg z-10">
          <SearchPopup query={searchData.query} onSelect={handleSelectItem} onClose={() => setShowPopup(false)} type={searchData.type} />
        </div>
      )}
    </div>
  );
};

export default SmartInput;
