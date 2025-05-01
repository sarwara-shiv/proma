import React, { ReactNode } from 'react';

// Define the types for the props
interface CustomSelectListProps {
  nav: {_id:string, name:ReactNode}[];
  selectedValue?: string; 
  size?:'sm'|'md'|'lg';
  type?:'button' | 'link';
  onClick: (value: string) => void; 
}

// CustomSelectList component
const ButtonMenu: React.FC<CustomSelectListProps> = ({
  nav,
  selectedValue, 
  size='sm',
  type='link',
  onClick,
}) => {
  const handleClick = (value:string) => {
    onClick(value)
  };

  return (
    <div className="flex flex-col">
      <div
        className={`items-center space-x-2}`}
      >
        {nav && 
          <div className='flex gap-2 flex-wrap'>
            {type === 'button' && <>
                {nav.map((item, index) => (
                    <div key={item._id} onClick={()=>handleClick(item._id)} 
                    className={`
                        py-0.5 px-1 text-${size} border border-white rounded-sm cursor-pointer hover:text-primary hover:bg-primary-light
                        ${selectedValue && selectedValue === item._id ? 'bg-primary-light text-primary ' : 'bg-gray-200 text-gray-600 shadow'}
                        `}
                        >
                        <span>{item.name}</span>
                        </div>
                    ))}
                </>
            }
            {type === 'link' && <>
                {nav.map((item, index) => (
                    <div key={item._id} onClick={()=>handleClick(item._id)} 
                    className={`
                        py-0.5 px-1 text-${size} border-b cursor-pointer hover:text-gray-700 font-semibold
                        ${selectedValue && selectedValue === item._id ? 'text-gray-700 border-primary' : 'text-gray-400 border-transparent '}
                        `}
                        >
                        <span>{item.name}</span>
                        </div>
                    ))}
                </>
            }
          </div>
        }
      </div>
    </div>
  );
};

export default ButtonMenu;
