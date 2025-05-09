import { useEffect, useState } from 'react';

interface ArgsType {
  initialState: boolean;
  size?: number;
  onClick?:()=>void
}

const BurgerToX: React.FC<ArgsType> = ({ initialState, size = 30, onClick }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(initialState);
  }, [initialState]);

  const toggleButton = ()=>{
    setOpen(!open); 
    onClick && onClick()
  }


  // Dynamic styles
  const lineWidth = size * 0.6; // e.g., 18 for 30px button
  const lineHeight = size * 0.07; // e.g., 1.5px
  const translateY = size * 0.07 / 4; // offset for top/bottom lines

  console.log(translateY);

  return (
    <button
      onClick={toggleButton}
      className="relative flex items-center justify-center group"
      style={{ width: size, height: size }}
    >
      <span
        className={`absolute bg-black rounded transition-transform duration-300`}
        style={{
          width: lineWidth,
          height: lineHeight,
          transform: open
            ? `rotate(45deg) translateY(${translateY}px)`
            : `translateY(-${translateY * 10}px)`,
        }}
      />
      <span
        className={`absolute bg-black rounded transition-opacity duration-300`}
        style={{
          width: lineWidth,
          height: lineHeight,
          opacity: open ? 0 : 1,
        }}
      />
      <span
        className={`absolute bg-black rounded transition-transform duration-300`}
        style={{
          width: lineWidth,
          height: lineHeight,
          transform: open
            ? `rotate(-45deg) translateY(-${translateY}px)`
            : `translateY(${translateY * 10}px)`,
        }}
      />
    </button>
  );
};

export default BurgerToX;
