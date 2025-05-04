import React, { useEffect, useState } from 'react';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const PageNavigate = () => {
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const updateHistoryState = () => {
        setCanGoBack((window.history.state?.idx ?? 0) > 0);
    };

    console.log(window.history.state?.idx);

    updateHistoryState();

    window.addEventListener('popstate', updateHistoryState);
    return () => window.removeEventListener('popstate', updateHistoryState);
  }, []);

  return (
    <>
    {canGoBack && 
    <div className="flex gap-2 p-2">
      <div onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded cursor-pointer">
        <span>
            <MdArrowBack />
        </span>
      </div>
    </div>
    }
    </>
  );
};

export default PageNavigate;
