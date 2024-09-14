import React from 'react';

// Define the type for a single option in the data array
interface Option {
  _id: string;
  name: string;
}

// Define the types for the props
interface CustomSelectListProps {
  label: string;
  data: any[]; // Data will be an array of Option objects
  inputType: 'radio' | 'checkbox' | 'dropdown'; // Three types of input
  name: string; // To identify radio/checkbox groups
  selectedValue?: string | string[]; // For single value (radio, dropdown) or array (checkbox)
  onChange: (value: string | string[]) => void; // Handle change event
}

// CustomSelectList component
const CustomSelectList: React.FC<CustomSelectListProps> = ({
  label,
  data,
  inputType,
  name,
  selectedValue,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (inputType === 'checkbox') {
      const checkedBoxes = Array.from(
        document.querySelectorAll(`input[name="${name}"]:checked`)
      ).map((input) => (input as HTMLInputElement).value);
      onChange(checkedBoxes); // Return array of selected values for checkboxes
    } else {
      onChange(event.target.value); // Return single selected value for radio or dropdown
    }
  };

  return (
    <div className="flex flex-col">
      <label>{label}</label>
      <div
        className={`fields-${inputType}-wrapper ${(inputType === 'checkbox' || inputType === 'radio') && 'items-center space-x-2'}`}
      >
        {inputType === 'radio' &&
          data.map((item, index) => (
            <div key={item._id} className="inline-flex items-center">
              <input
                type="radio"
                name={name}
                value={item._id}
                className="peer sr-only"
                id={`${name}-${index}`}
                // checked={item._id === selectedValue}
                onChange={handleChange}
              />
              <label
                htmlFor={`${name}-${index}`}
                className="
                  cursor-pointer
                  px-2
                  py-1
                  rounded
                  text-sm
                  border
                  text-gray-400
                  border-gray-200/50
                  bg-gray-200/50
                  focus:outline-none
                  active:outline-none
                  peer-checked:bg-primary-light
                  peer-checked:text-primary
                  peer-checked:border-transparent
                  peer-focus:ring-none
                  peer-focus:ring-none
                  transition-colors
                  duration-150
                "
              >
                {item.name}
              </label>
            </div>
          ))}

        {inputType === 'checkbox' &&
          data.map((item, index) => (
            <div key={item._id} className="inline-flex items-center my-1">
              <input
                type="checkbox"
                name={name}
                value={item._id}
                className="peer sr-only"
                id={`${name}-${index}`}
                // checked={Array.isArray(selectedValue) && selectedValue.includes(item._id)} 
                onChange={handleChange}
              />
              <label
                htmlFor={`${name}-${index}`}
                className="
                  cursor-pointer
                  px-2
                  py-1
                  rounded
                  text-sm
                  border
                  text-gray-400
                  border-gray-200/50
                  bg-gray-200/50
                  focus:outline-none
                  active:outline-none
                  peer-checked:bg-primary-light
                  peer-checked:text-primary
                  peer-checked:border-transparent
                  peer-focus:ring-none
                  peer-focus:ring-none
                  transition-colors
                  duration-150
                "
              >
                {item.name}
              </label>
            </div>
          ))}

        {inputType === 'dropdown' && (
          <select name={name} onChange={handleChange} defaultValue={selectedValue as string}>
            {data.map((item, index) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default CustomSelectList;
