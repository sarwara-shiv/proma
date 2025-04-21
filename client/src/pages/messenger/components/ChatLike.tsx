import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { MdAdd } from 'react-icons/md';
import { BsEmojiSmile } from 'react-icons/bs';
import { MessageType } from '../../../features/chat/chatTypes';
import { ObjectId } from 'mongodb';
import { useSocket } from "../../../context/SocketContext";

interface ArgsType{
    messageId:string|ObjectId,
    userId:string|ObjectId,
    chat?:MessageType
}

const ChatLike:React.FC<ArgsType> = ({messageId, userId, chat}) => {
  const quickEmojis = ['👍','🖐️','😊', '❤️', '🔥'];
  const socket = useSocket();
  const [showReactionBox, setShowReactionBox] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [popupStyles, setPopupStyles] = useState<React.CSSProperties>({});
  const [pickerStyles, setPickerStyles] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const pickerWidth = 350;
  const pickerHeight = 400;
  const quickBoxWidth = 200;
  const quickBoxHeight = 48;

  const addEmoji = (emoji: any) => {
    console.log('Selected emoji:', emoji.native);
    console.log(chat)
    console.log(userId)
    console.log(messageId)
    if (socket && userId && messageId) {
        socket.emit('like-message', messageId, userId, emoji.native);
    }else{
        console.log('no socket');
    }
    setShowFullPicker(false);
    setShowReactionBox(false);
  };

  const positionPopup = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // --- QUICK REACTIONS ---
    let top = triggerRect.top + window.scrollY - quickBoxHeight - 8;
    if (top < 8) top = triggerRect.bottom + window.scrollY + 8;

    let left = triggerRect.left + window.scrollX + triggerRect.width / 2 - quickBoxWidth / 2;
    if (left + quickBoxWidth > viewportWidth - 8) left = viewportWidth - quickBoxWidth - 8;
    if (left < 8) left = 8;

    setPopupStyles({
      position: 'absolute',
      top,
      left,
      zIndex: 9999,
    });

    // --- FULL EMOJI PICKER ---
    let pickerTop = quickBoxHeight + 8; // default below the quick box
    let pickerLeft = 0;

    const hasSpaceBelow = triggerRect.bottom + pickerHeight + 100 < viewportHeight;
    const hasSpaceAbove = triggerRect.top - pickerHeight - 100 > 0;

    if (!hasSpaceBelow && hasSpaceAbove) {
      pickerTop = -pickerHeight - 8;
    }

    // Check horizontal fit
    const spaceRight = viewportWidth - triggerRect.right;
    const spaceLeft = triggerRect.left;

    if (spaceRight >= pickerWidth) {
      pickerLeft = 0;
    } else if (spaceLeft >= pickerWidth) {
      pickerLeft = quickBoxWidth - pickerWidth;
    } else {
      pickerLeft = Math.max(-8, (quickBoxWidth - pickerWidth) / 2);
    }

    setPickerStyles({
      position: 'absolute',
      top: pickerTop,
      left: pickerLeft,
      zIndex: 9999,
    });
  };

  const openReactionBox = () => {
    positionPopup();
    setShowReactionBox(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setShowReactionBox(false);
        setShowFullPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', positionPopup);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', positionPopup);
    };
  }, []);

  const renderPopup = () =>
    ReactDOM.createPortal(
      <div ref={popupRef} style={popupStyles} className="bg-white p-2 rounded-lg shadow flex items-center gap-2 w-max">
        {quickEmojis.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => addEmoji({ native: emoji })}
            className="text-xl transition hover:bg-primary-light aspect-1/1 w-[30px] h-[30px] rounded-full"
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={() => setShowFullPicker(true)}
          className="text-xl font-bold bg-slate-200/50 hover:bg-primary-light aspect-1/1 rounded-full transition p-1"
        >
          <MdAdd />
        </button>

        {showFullPicker && (
          <div style={pickerStyles}>
            <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openReactionBox}
        className="text-xl hover:bg-primary-light transition aspect-1/1 rounded-full bg-slate-200/20 text-slate-800"
      >
        <BsEmojiSmile />
      </button>
      {showReactionBox && renderPopup()}
    </>
  );
};

export default ChatLike;
