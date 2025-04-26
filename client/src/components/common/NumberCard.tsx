import React, { ReactNode } from "react"

interface ArgsType{
    title:ReactNode;
    value: string|number|ReactNode
    icon?: React.ComponentType;
    colors?:string;
    minWidth?:number;
    onClick?:()=>void;
}
const NumberCard:React.FC<ArgsType> = ({title, value, icon, colors, minWidth=40, onClick})=>{
    return  (

        <div className={`card gap-5 border border-white shadow-none 
            min-w-${minWidth} 
            ${colors ?  colors : "bg-blue-100" }
            p-3 rounded-lg flex justify-between items-center ${onClick && 'hover:shadow-lg transition-all ease cursor-pointer'}
            `}
            onClick={onClick && onClick}
            >
        <div className="text-center">
            <div className='font-bold text-xl text-slate-600'>{value}</div>
            <div className=' text-xs text-slate-500'>{title}</div>
        </div>
        {icon && 
        <div className='bg-white p-0.5 text-primary text-xl rounded-full shadow'
        
        >
            {React.createElement(icon)}
        </div>
        }
    </div>
    )
}

export default NumberCard;