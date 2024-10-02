import { FaRegEdit } from 'react-icons/fa'; // Example icon, you can use any other

interface ArgsType{
  text?:string,
  icon?:React.ReactNode,
  onClick?:()=>void;
}

const CustomIconButton:React.FC<ArgsType> = ({ text = "Edit", icon = <FaRegEdit />, onClick }) => {
  return (
    <div
      className="
      group
        flex items-center gap-2
        bg-primary-light text-primary
        justify-center
        border border-white
        shadow-md rounded-full
        cursor-pointer
        fixed bottom-[1em] right-[1em]
        h-[50px] 
        w-[50px]  // Default size
        z-50
        overflow-hidden
        transition-all duration-300 ease-in-out
        hover:w-auto  // Automatically adjust width based on content
        hover:pr-4   // Add padding to the right when expanded
        hover:bg-primary hover:text-white hover:shadow-lg
      "

      onClick={onClick}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-[40px] h-[40px] transition-all duration-300 ease">
        {icon}
      </div>
      {/* Text (hidden initially) */}
      <span
        className="
          whitespace-nowrap
          opacity-0
          text-sm
          transition-opacity duration-300 ease-in-out
          group-hover:opacity-100
          hidden
          group-hover:inline
        "
      >
        {text}
      </span>
    </div>
  );
};

export default CustomIconButton;
