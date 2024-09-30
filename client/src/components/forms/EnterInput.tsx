import React, { useState } from "react";
import { IoAdd } from "react-icons/io5";

interface ArgsType{
    name:string;
    onEnter:({name, value}:{name:string, value:string})=>void
}

const EnterInput: React.FC<ArgsType> = ({name, onEnter}) => {
  // Define the state for the input value
  const [inputValue, setInputValue] = useState<string>("");

  // Define the state to store the value when Enter is pressed
  const [storedValue, setStoredValue] = useState<string>("");

  // Handler for input value change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
  };

  // Handler for key press event
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        updateValue();
    }
  };

  const updateValue = ()=>{
    setStoredValue(inputValue);  // Store value when Enter is pressed
    console.log("Stored value:", inputValue);
    setInputValue("");  // Clear the input after storing the value
    onEnter({name:name, value:inputValue});
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}  // Listen for the key press event
        placeholder="Type and press Enter"
        className={`bg-gray-50 border border-gray-300 focus:ring-primary focus:border-primary text-gray-900 text-sm rounded-sm focus:outline-none block w-full py-2.5 pl-2.5 pe-[40px] dark:bg-gray-700`}
      />
       <div className="bg-slate-100 border border-gray-300 text-lg font-bold p-2.5 absolute top-0 right-0 cursor-pointer w-[40px] h-[100%] flex justifiy-center items-center 
       text-green-600 hover:bg-green-100 hover:border-green-600 hover:text-green-600
       "
        onClick={updateValue}
       >
        <IoAdd />
        </div> 
    </div>
  );
};

export default EnterInput;
