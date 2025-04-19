import React, { useRef, useState } from 'react';

interface ArgsType {
  name: string;
  data?: any;
  value: number;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    data: any
  ) => void;
  onBlur: (value: number, data: any) => void;
  children?: React.ReactNode;
}

const ClickToEditNumber: React.FC<ArgsType> = ({
  name,
  data = "",
  value,
  onChange,
  onBlur,
  children
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [nValue, setNValue] = useState<string>(value.toString());

  const handleDivClick = () => {
    if (textRef.current && inputRef.current) {
      textRef.current.style.display = 'none';
      inputRef.current.style.display = 'block';
      inputRef.current.focus();
    }
  };

  const handleInputBlur = () => {
    if (textRef.current && inputRef.current) {
      const numericValue = parseFloat(nValue);
      textRef.current.textContent = isNaN(numericValue) ? '-' : numericValue.toString();
      textRef.current.style.display = 'block';
      inputRef.current.style.display = 'none';
      onBlur(numericValue, data);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow only numbers (including empty string and decimal point)
    if (/^(\d+)?(\.\d*)?$/.test(input) || input === '') {
      setNValue(input);
      if (onChange) onChange(e, data);
    }
  };

  return (
    <div>
      <div
        ref={textRef}
        onClick={handleDivClick}
        className="border border-transparent px-1 py-0.2 min-h-[20px] hover:border-slate-300"
      >
        {nValue && !isNaN(Number(nValue)) ? nValue : '-'}
      </div>

      {children ? children : (
        <input
          ref={inputRef}
          type="text"
          value={nValue}
          style={{ display: 'none' }}
          onChange={handleChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          inputMode="numeric"
          pattern="[0-9]*"
          className="w-full border-none outline-none border border-transparent px-1 py-0.2 focus:border focus:border-slate-400 focus:outline-none"
        />
      )}
    </div>
  );
};

export default ClickToEditNumber;
