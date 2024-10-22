import React from 'react'

interface ArgsType{
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
}

const DocumentationsAll:React.FC<ArgsType> = ({setSubNavItems}) => {
  return (
    <div>
      All Documentation
    </div>
  )
}

export default DocumentationsAll
