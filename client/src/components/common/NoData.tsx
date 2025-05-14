import React, { ReactNode } from 'react';

interface ArgsType {
    content?: React.ReactNode | string;
    children?: React.ReactNode;
    size?:'xs' | 'sm' | 'md' | 'lg';
    color?:string;
}

const NoData: React.FC<ArgsType> = ({ content = '', children, size="sm", color='red-500' }) => {
    return (
        <div className={`w-full h-full flex align-center content-center items-center text-${size} text-${color}`}>
            {children || content || <h6>No Data Found</h6>}
        </div>
    );
}

export default NoData;