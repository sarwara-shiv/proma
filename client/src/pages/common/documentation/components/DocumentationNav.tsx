import { Documentation } from '@/interfaces';
import React, { useEffect, useState } from 'react';
import { MdChevronRight } from 'react-icons/md';

interface ArgsType {
  records: Documentation[];
  setActiveDocData?: React.Dispatch<React.SetStateAction<any>>;
}

const DocumentationNav: React.FC<ArgsType> = ({ records, setActiveDocData }) => {
  const [items, setItems] = useState<Documentation[]>(records);
  const [activeTask, setActiveTask] = useState<string[]>([]);
  const [openDoc, setOpenDoc] = useState<Documentation| null>(null)


  useEffect(()=>{
    setItems(records);
  }, [records])

    // toggle subtasks
    const handleTaskClick = (taskId: string) => {
      setActiveTask((prevActiveTasks) =>
          prevActiveTasks.includes(taskId)
            ? prevActiveTasks.filter((id) => id !== taskId) // Remove taskId if it exists
            : [...prevActiveTasks, taskId] // Add taskId if it doesn't exist
        );
  };

  const handleDocClick = (doc:Documentation)=>{
    setOpenDoc(doc);
    setActiveDocData && setActiveDocData(doc);
  }

  return (
    <div>
      {items && items.length > 0 && items.map((record, index)=>{
        return (
          <div key={`main-${index}-${record._id}`} className='py-0.5'>
          <div className='flex justify-between gap-1 items-center'>
              <div className='p-1 w-full flex justify-between items-center border-b'>
                  <span className={`font-medium text-xs flex justify-start items-center gap-1 cursor-pointer
                      ${openDoc && openDoc._id === record._id && 'text-primary '}
                  `}
                  onClick={()=>handleDocClick(record)}
                  >
                      {record.name}
                  </span>
                  {record.subDocuments && record.subDocuments.length > 0 && 
                      <div onClick={()=> handleTaskClick(record._id || '')}
                      className={`bg-transparent hover:bg-primary-light cursor-pointer`}
                      >
                          <MdChevronRight className={`${record._id && activeTask.includes(record._id) ? '-rotate-90' : 'rotate-90'}
                              transition-transform duration-200 ease
                              `} /> 
                      </div>
                  }
              </div>
             
          </div>
          {record.subDocuments && record.subDocuments.length > 0 && record.subDocuments.map((subtaskL1,index1)=>{
              const subtask1 = subtaskL1 as unknown as Documentation;
              return (
              <div key={`main-${index1}-${subtask1._id}`} className={` ml-2 
              overflow-hidden transition-all duration-200
                  ${record._id && activeTask.includes(record._id) ? 'h-auto border-l-2 border-primary' : 'h-0'}
              `}>
                  <div className='p-1 flex justify-between gap-1 items-center'>
                      <span className={`font-normal text-xs flex justify-start items-center gap-1 cursor-pointer
                           ${openDoc && openDoc._id === subtask1._id && 'text-primary '}
                      `}
                      onClick={()=>handleDocClick(subtask1)}
                      >
                          {subtask1.name}
                      </span>
                                                                      
                      {subtask1.subDocuments && subtask1.subDocuments.length > 0&& 
                              <div  
                              data-close-menu='true'
                              onClick={()=> handleTaskClick(subtask1._id || '')}
                                  className={`bg-transparent hover:bg-primary-light cursor-pointer`}
                              >
                                  <MdChevronRight className={`${subtask1._id && activeTask.includes(subtask1._id ) ? '-rotate-90' : 'rotate-90'}
                                      transition-transform duration-200 ease
                                  `} 
                                  
                                  /> 
                              </div>
                          }
                    
                  </div> 
                  {subtask1.subDocuments && subtask1.subDocuments.length > 0 && subtask1.subDocuments.map((subtaskL2,index2)=>{
                      const subtask2 = subtaskL2 as unknown as Documentation;
                      return (
                      <div key={`main-${index2}-${subtask2._id}`} className={` ml-2
                          ${subtask1._id && activeTask.includes(subtask1._id )? 'h-auto border-l-2 border-primary' : 'h-0'}
                          `}
                      > 
                          <div className='p-1 flex justify-between gap-1 items-center'>
                          <span className={`font-normal text-xs flex justify-start items-center gap-1 cursor-pointer
                              ${subtask2.subDocuments && subtask2.subDocuments.length > 0 && ''}
                              ${openDoc && openDoc._id === subtask2._id && 'text-primary '}
                          `} 
                          onClick={()=>handleDocClick(subtask2)}
                          >
                             {subtask2.name}
                          </span>
                      </div>                       
                      </div>)
                  })
                  }  

              </div>
              
          )
           })
          }                         
      </div>
  );
      })}
    </div>
  );
};

export default DocumentationNav;
