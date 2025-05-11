import React, { ReactNode } from 'react'
interface ArgsType{
    text:ReactNode;
    size?:'base' | 'sm'| 'md'| 'lg'| 'xl';
    type?: 'section' | 'default' | 'h1'| "h2" | "h3" | "h4" | "h5" | "h6";
    classes?:string
}
const Headings: React.FC<ArgsType> = ({ text,size="base", classes="", type='default' }) => {

  const styles = {
    h1 : `text-3xl text-primary font-bold`,
    h2 : `text-2xl ${ classes || 'text-slate-800'} font-bold`,
    h3 : `text-xl ${ classes || 'text-slate-700'} font-bold`,
    h4 : `text-lg ${ classes || 'text-slate-700'} font-semibold`,
    h5 : `text-md ${ classes || 'text-slate-700'} font-semibold`,
    h6 : `text-sm ${ classes || 'text-slate-700'} font-semibold`,
  }

  const getStyles = (stype: 'h1'| "h2" | "h3" | "h4" | "h5" | "h6")=>{
    if(styles[stype]){
      return styles[stype];
    }
  }

  return (
    <>
    {type === 'section' || type === 'default' ? 
      <div className={`text-${size} ${type === 'section' ? 'text-lg font-bold text-slate-700 ': 'text-slate-300 ' }${classes}`}>
        {text}
      </div>:
      <div className={` ${getStyles(type)}`}>
        {text}
      </div>
    }
    </>
  )
}

export default Headings 
