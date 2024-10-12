import React, { useRef, useState } from 'react';

interface ArgsType{
    name:string,
    data?:any,
    value:string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, data:any) => void;
    onBlur:(value:string, data:any)=>void;
    children?: React.ReactNode;
}


const ClickToEdit: React.FC<ArgsType> = ({name, data="", value, onChange, onBlur, children}) => {
  const textRef = useRef<HTMLDivElement>(null); // Reference for the div
  const inputRef = useRef<HTMLInputElement>(null); // Reference for the input
  const [nValue, setnValue] = useState<string>(value);

  // Function to replace text with input field
  const handleDivClick = () => {
    if (textRef.current && inputRef.current) {
      textRef.current.style.display = 'none'; // Hide the div
      inputRef.current.style.display = 'block'; // Show the input
      inputRef.current.focus(); // Focus on input
    }
  };

  // Function to handle when input field loses focus
  const handleInputBlur = () => {
    if (textRef.current && inputRef.current) {
      textRef.current.textContent = inputRef.current.value; // Update the div with the input value
      textRef.current.style.display = 'block'; // Show the div
      inputRef.current.style.display = 'none'; // Hide the input
      onBlur(nValue, data);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        if (textRef.current && inputRef.current) {
            textRef.current.textContent = inputRef.current.value; // Update the div with the input value
            textRef.current.style.display = 'block'; // Show the div
            inputRef.current.style.display = 'none'; // Hide the input
            onBlur(nValue, data);
          }
    }
  };

  return (
    <div>
      {/* This div will show the text */}
      <div ref={textRef} onClick={handleDivClick} className={`
            border border-transparent px-1 py-0.2 min-h-[20px] hover:border-slate-300
        `}>
        {nValue && nValue.replace(/\s+/g, '') ? <>{nValue}</> : <>-</>}
      </div>
      
      {/* This input will replace the div when clicked */}
      {children ? children : 
        <input
          ref={inputRef}
          type="text"
          defaultValue={nValue}
          style={{ display: 'none' }}
          onChange={(e)=>setnValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          className={`w-full
                border-none, outline-none, border border-transparent px-1 py-0.2
                focus:border focus:border-slate-400  focus:outline-none 
              `}
        />
      }
    </div>
  );
};

export default ClickToEdit;
