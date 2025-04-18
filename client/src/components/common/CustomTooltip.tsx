import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  minHeight?: string;
  className?: string;
  trigger?: 'hover' | 'click';
  showIcon?: boolean;
}

const CustomTooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  maxWidth,
  minWidth,
  maxHeight,
  minHeight,
  className = '',
  trigger = 'hover',
  showIcon = true,
}) => {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const updatePosition = () => {
    if (tooltipRef.current && wrapperRef.current) {
      const tooltip = tooltipRef.current;
      const wrapper = wrapperRef.current;
      const rect = wrapper.getBoundingClientRect();

      let top = 0, left = 0;

      switch (side) {
        case 'top':
          top = rect.top - tooltip.offsetHeight - 8;
          left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
          left = rect.left - tooltip.offsetWidth - 8;
          break;
        case 'right':
        default:
          top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
          left = rect.right + 8;
          break;
      }

      setStyle({
        top,
        left,
        position: 'fixed',
        maxWidth,
        minWidth,
        maxHeight,
        minHeight,
        zIndex: 9999,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    };

    if (trigger === 'click' && visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, trigger]);

  useEffect(() => {
    if (visible) updatePosition();
  }, [visible]);

  const hoverHandlers =
    trigger === 'hover'
      ? {
          onMouseEnter: () => setVisible(true),
          onMouseLeave: () => setVisible(false),
        }
      : {};

  const clickHandler =
    trigger === 'click'
      ? {
          onClick: () => setVisible((v) => !v),
        }
      : {};

  return (
    <div
      ref={wrapperRef}
      className="relative inline-flex items-center space-x-1 cursor-pointer"
      {...hoverHandlers}
      {...clickHandler}
    >
      {children}
      {trigger === 'click' && showIcon && (
        <span className="text-gray-500 text-xs select-none">ℹ️</span>
      )}

      {visible &&
        ReactDOM.createPortal(
          <div
            ref={tooltipRef}
            style={style}
            className={`bg-primary-light border border-white shadow-md text-slate-500 z-40 text-xs px-2 py-1 rounded shadow-lg w-fit ${className}`}
          >
            {typeof content === 'string' ? (
              <span dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              content
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default CustomTooltip;
