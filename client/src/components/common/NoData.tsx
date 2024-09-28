import React, { ReactNode } from 'react';

interface ArgsType {
    content?: React.ReactNode | string;
    children?: React.ReactNode;
}

const NoData: React.FC<ArgsType> = ({ content = '', children }) => {
    return (
        <div className='w-full h-full flex align-center content-center items-center'>
            {children || content || <h6>No Data Found</h6>}
        </div>
    );
}

export default NoData;