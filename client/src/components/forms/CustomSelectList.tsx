import React from 'react';

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
      onChange(checkedBoxes); 
    } else {
      onChange(event.target.value);
    }
  };

  return (
    <div className="flex flex-col">
      <label className='text-gray-400 flex items-center text-sm'>{label}</label>
      <div
        className={`fields-${inputType}-wrapper ${(inputType === 'checkbox' || inputType === 'radio') && 'items-center space-x-2'}`}
      >
        {inputType === 'radio' &&
          data.map((item, index) => {
            const isChecked = selectedValue === item._id;

            return (
            <div key={item._id} className="inline-flex items-center mb-2">
              <input
                type="radio"
                name={name}
                value={item._id}
                className="peer sr-only"
                id={`${name}-${index}`}
                onChange={handleChange}
                checked={isChecked} // Ensure checked is set based on selectedValue
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
                {item.displayName || item.name}
              </label>
            </div>
          )}
          )}

        {inputType === 'checkbox' &&
          data.map((item, index) => (
            <div key={item._id} className="inline-flex items-center my-1">
              <input
                type="checkbox"
                name={name}
                value={item._id}
                className="peer sr-only"
                id={`${name}-${index}`}
                onChange={handleChange}
                checked={Array.isArray(selectedValue) && selectedValue.includes(item._id)} // Ensure checked works for checkboxes
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
                {item.displayName || item.name}
              </label>
            </div>
          ))}

        {inputType === 'dropdown' && (
          <select name={name} onChange={handleChange} defaultValue={selectedValue as string}>
            {data.map((item, index) => (
              <option key={item._id} value={item._id}>
                {item.displayName || item.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default CustomSelectList;
