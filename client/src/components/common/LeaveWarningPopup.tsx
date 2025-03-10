import React from "react";
import { useNavigate } from "react-router-dom";

interface LeaveWarningPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
}

const LeaveWarningPopup: React.FC<LeaveWarningPopupProps> = ({ isOpen, onClose, onConfirmLeave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-lg font-semibold">Warning</h2>
        <p className="mt-2">You have an active worklog or daily report. Please submit or close before leaving.</p>
        
        <div className="mt-4 flex justify-center gap-4">
          <button onClick={onConfirmLeave} className="bg-red-500 text-white px-4 py-2 rounded">
            Leave Anyway
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Stay
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveWarningPopup;
