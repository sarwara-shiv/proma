import { ReactNode } from "react";

interface ArgsType{
    nav:{_id:string, label:string, icon?:ReactNode}[]
    onClick:(value:string)=>void
    selectedNav?:string;
}
const FloatingBottomMenu:React.FC<ArgsType> = ({nav, onClick, selectedNav})=>{
    return (
        <div className='sticky bottom-4 right-4 pr-1 mt-10 '>
            <div className='flex justify-center items-center mb-2 bg-white rounded-md box-shadow gap-2'>
                {nav && nav.length > 0 && nav.map((item, idx)=>{return (
                    <div key={`${idx}-${item._id}`} className='flex justify-end gap-1'>
                        {/* Dashboard */}
                        <div onClick={()=>{onClick(item._id)}}
                            className={`group flex flex-col justify-center items-center py-1 px-2 cursor-pointer 
                                ${selectedNav && selectedNav === item._id ? 'bg-primary-light ' : ''} rounded-lg border-2 border-white`
                            }
                            >
                            <span 
                            className={`aspect-1/1 p-1 text-xl
                                transition-transform duration-100 ease origin-center
                                ${selectedNav && selectedNav === item._id && 'text-primary'}
                                ${selectedNav && selectedNav !== item._id ? 'group-hover:scale-110 group-hover:text-primary' : ''}
                            `}>
                                {item.icon && item.icon}
                            </span>
                            <span className='text-[11px]'>
                                {item.label}
                            </span>
                        </div>
                    </div>

                )})}
                
            </div>
        </div>
    )
}

export default FloatingBottomMenu;