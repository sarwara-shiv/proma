import React, { ReactNode } from "react"
import { IoInformation } from "react-icons/io5";

interface ArgsType{
    title:ReactNode;
    value: string|number|ReactNode
    icon?: React.ComponentType;
    colors?:string;
    minWidth?:number;
    maxWidth?:number;
    showIcon?:boolean;
    onClick?:()=>void;
}
const NumberCard:React.FC<ArgsType> = ({title, value, icon = IoInformation, colors, minWidth='auto', maxWidth='auto', showIcon=true, onClick})=>{
    return  (

        <div className={`card gap-5 border border-white shadow-none mb-0 w-fit gap-1
            min-w-${minWidth} max-w-${maxWidth} 
            ${colors ?  colors : "bg-blue-100" }
            p-3 rounded-lg flex justify-between items-center 
            `}
            onClick={!showIcon ? onClick : undefined}
            >
        <div className="text-center">
            <div className='font-bold text-xl text-slate-600'>{value}</div>
            <div className=' text-xs text-slate-500'>{title}</div>
        </div>
        {icon && showIcon &&
        <div className={`bg-white p-0.5 text-primary text-xl rounded-full shadow hover:bg-primary hover:text-white 
            ${onClick && 'hover:bg-primary hover:text-white transition-all ease cursor-pointer'}`}
        onClick={onClick && onClick}
        >
            {React.createElement(icon)}
        </div>
        }
    </div>
    )
}

export default NumberCard;