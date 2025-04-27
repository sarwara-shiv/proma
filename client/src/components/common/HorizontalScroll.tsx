import { useRef, useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { MdArrowBack, MdArrowForward, MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export default function HorizontalScroll({ children, className = "" }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollStart(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1; // You can adjust speed by changing the multiplier
    scrollRef.current.scrollLeft = scrollStart - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    const scrollContainer = scrollRef.current;
    scrollContainer?.addEventListener("scroll", updateScrollButtons);

    return () => {
      window.removeEventListener("resize", updateScrollButtons);
      scrollContainer?.removeEventListener("scroll", updateScrollButtons);
    };
  }, []);

  return (
    <div className={`relative w-full ${className} ${(canScrollLeft || canScrollRight) && 'px-3'} `}>
      {/* Left Arrow */}
      {(canScrollLeft || canScrollRight) && 
        <button
        onClick={() => scroll("left")}
        className={`absolute -left-4 top-1/2 -translate-y-1/2 z-10   rounded-full p-0.5 
            ${canScrollLeft ? 'text-slate-600 cursor-pointer opacity-100 hover:text-primary' 
                : 'pointer-events-none opacity-40'}`}
        >
          <MdOutlineChevronLeft size={30} />
        </button>
        }

      {/* Scrollable Area */}
      <div
        ref={scrollRef}
        className={`flex overflow-x-scroll no-scrollbar space-x-4 py-2 ${(canScrollLeft || canScrollRight) && 'px-4'} cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {/* Right Arrow */}
      {(canScrollLeft || canScrollRight) && 
        <button
          onClick={() => scroll("right")}
          className={`absolute -right-4 top-1/2 -translate-y-1/2 z-10  rounded-full p-0.5 
            ${canScrollRight ? 'cursor-pointer opacity-100 text-slate-600 hover:text-primary' 
                : 'pointer-events-none opacity-40'}`}
        >
          <MdOutlineChevronRight size={30} />
        </button>
    }
    </div>
  );
}
