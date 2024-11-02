import { CustomInput } from '../../../../components/forms';
import { CustomAlert, FlashPopup, FormButton, PageTitel, ToggleSwitch } from '../../../../components/common';
import { AlertPopupType, DeleteRelated, Documentation, DynamicCustomField, FlashPopupType, NavItem, OrderByFilter, PaginationProps, QueryFilters, RelatedUpdates } from '@/interfaces';
import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import { MdAdd, MdChevronRight, MdClose, MdEdit, MdMenu } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import RichtTextEditor from '../../../../components/forms/RichtTextEditor';
import { addUpdateRecords, getRecordsWithFilters } from '../../../../hooks/dbHooks';
import { useAuth } from '../../../../hooks/useAuth';
import { DeleteById } from '../../../../components/actions';
import CustomContextMenu from '../../../../components/common/CustomContextMenu';
import { extractRecursiveIds } from '../../../../utils/commonUtils';
import CustomSmallButton from '../../../../components/common/CustomSmallButton';
import { FaEye } from 'react-icons/fa';
import DocumentationNav from './DocumentationNav';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
interface ArgsType{
    setSubNavItems?: React.Dispatch<React.SetStateAction<any>>;
}

const checkDataBy: string[] = ['name'];

const EmptyCustomField:DynamicCustomField = {
    name:'',
    value:''
}


const DocumentationsForm:React.FC<ArgsType> = ({setSubNavItems}) => {
    const {t} = useTranslation();
    const {user} = useAuth();
    const {action, id} = useParams();
    const [loader, setLoader] = useState(true);
    const [records, setRecords] = useState<Documentation[]>([]);
    const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
    const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
    const [paginationData, setPaginationData] = useState<PaginationProps>({currentPage:1,totalRecords:0, limit:50, totalPages:0})
    const [parentData, setParentData] = useState<Documentation | null>(null);
    const [activeTask, setActiveTask] = useState<string[]>([]);
    const [formAction, setFormAction] = useState<string>('add');

    const initialFormData:Documentation={
            _pid:id,
            name:'',
            privacy:'private',
            description:'',
            customFields:[],
            subDocuments:[]
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
    const [formData, setFormData] = useState<Documentation>(initialFormData);
    let navItems: NavItem[] = [
        { link: `projects`, title: "projects_all" },
        { link: `projects/view/${id}`, title: "project" },
        { link: `documentation/add/${id}`, title: "documentation_add" },
    ];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

    useEffect(()=>{
        setSubNavItems && setSubNavItems(navItems);
        getRecords();
      },[])

    const handleInputChange = (name:string, value:string)=>{
        if(name){
            setFormData({...formData, [name]:value})
        }
    }

    const getRecords = async () => {
        setLoader(true);
        if(id){
        try {
            const filters:QueryFilters = {
                level:1,
                _pid:id
            }

            const populateFields = [
                { path: '_pid' }, 
                {
                  path: 'subDocuments',
                  populate: [
                    {
                      path: 'subDocuments',
                      populate: [
                        {
                          path: 'subDocuments',
                          populate: [
                            {
                              path: 'subDocuments',
                              populate: { path: 'subDocuments' },
                            },
                            { path: 'createdBy' }, 
                          ],
                        },
                        { path: 'createdBy' }, 
                      ],
                    },
                    { path: 'createdBy' }, 
                  ],
                },
              ]
            const res = await getRecordsWithFilters({
                type: "documentation", 
                limit:paginationData.limit as unknown as number, 
                pageNr:paginationData.currentPage as unknown as number, 
                populateFields, 
                filters,
            });  
            console.log(res);
            if (res.status === "success") {
                setRecords(res.data || []);
                console.log(res.data);
                console.log(res);
                setPaginationData({...paginationData, totalRecords:res.totalRecords, totalPages:res.totalPages, currentPage:res.currentPage})
            }else{
                setRecords([]);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
            setRecords([]);
        }finally{
            setLoader(false);
        }
        }
    };

    // toggle subtasks
    const handleTaskClick = (taskId: string) => {
        setActiveTask((prevActiveTasks) =>
            prevActiveTasks.includes(taskId)
              ? prevActiveTasks.filter((id) => id !== taskId) // Remove taskId if it exists
              : [...prevActiveTasks, taskId] // Add taskId if it doesn't exist
          );
    };

    // submit data
    const saveData = async()=>{
        try{
            let level = formData.level ? formData.level : 1;
            let relatedUpdates:RelatedUpdates[] = [];
            if(parentData  && formAction === 'add'){
                level = (parentData.level ? parentData.level +1  : 1);
                // update parent
                relatedUpdates= [{
                    collection:'documentation',
                    field:'subDocuments',
                    type:'array',
                    ids:[parentData._id || '']
                  }]
            }
            const userid = user?._id;
            if(userid){
                const createdBy = userid;
                console.log(formData);
                console.log(formData._id)
                console.log(parentData);
                const res = await addUpdateRecords({
                    type: 'documentation', id:formData._id || '', action:formAction as unknown as 'add'|'update', relatedUpdates, 
                    checkDataBy:checkDataBy, body:{ ...formData, createdBy, level}
                })

                if(res && res.status === 'success'){
                    const message = `${t(`RESPONSE.${res.code}`)}`;
                    setFlashPopupData({...flashPopupData, isOpen:true, message})
                    getRecords();
                }
                
                // console.log(res);
            }
        }catch(err){
            console.log(err)
        }
    }

    const addRemoveCustomField = async(index:number)=>{
        setFormData(prevVal => {
            // Copy customFields to avoid mutation
            const cfields = [...(prevVal.customFields || [])];
        
            if (typeof index === "number" && index >= 0 && index < cfields.length) {
              // Remove the custom field at the specified index
              cfields.splice(index, 1);
            } else {
              // Add an empty custom field if no index is provided
              cfields.push(EmptyCustomField);
            }
        
            return { ...prevVal, customFields: cfields };
          });
    }
    const updateCustomField = async(index:number, field:string, value:string)=>{
        console.log(field, value);
        setFormData(prevVal => {
            // Copy customFields to avoid mutation
            const cfields = [...(prevVal.customFields || [])];
        
            if (typeof index === "number" && index >= 0 && index < cfields.length) {
               cfields[index] = {...cfields[index], [field]:value} 
            }
        
            return { ...prevVal, customFields: cfields };
          });
    }

    const onDelete = (data:any)=>{
        if(data.status === "success"){ 
          getRecords();
        }else{
          console.error({error:data.message, code:data.code}); 
        }
    }

    const handlePrivacy = (isChecked:boolean, value?:string)=>{
        setFormData({...formData, privacy:value as unknown as 'private' | 'public'})
    }

    const handleDrag = (result: any) => {
        console.log(result);
      };

    // const add Sub section
    

  return (
    <div className='data-wrap relative'>
        <div className="flex h- relative overflow-y-auto">
            {/* Sidebar */}
            <div
                className={`transition-all duration-200 w-60 overflow-y-auto h-[100vh]  border-e  ${
                isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0  pointer-events-none' 
                } fixed h-full text-slate-700`}
            >
                <div className='p-2 text-sm font-bold text-primary
                    flex justify-between items-center bg-primary-light
                '>
                    <span>{t('mainDocs')}</span>
                    {parentData && 
                        <CustomContextMenu iconSize='xs'> 
                            <ul>
                                <li className='px-1 py-1 my-1 hover:bg-slate-100' >
                                    <div className='flex justify-between items-center text-xs gap-1 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words'
                                     data-close-menu='true'
                                     onClick={()=>{setParentData(null); setFormData(initialFormData); setFormAction('add')}}
                                    >
                                        {t('addMainSection')} <MdAdd />
                                    </div>
                                </li>
                            </ul>
                        </CustomContextMenu>
                    }
                </div>
             
                <div className="px-0 h-4/5 overflow-x-auto text-sm">
                {/* <DocumentationNav records={records} activeTask={activeTask}/> */}
                    {/* New documentation */}
                    {records && records.length > 0 && 
                        <DragDropContext onDragEnd={handleDrag}>
                        <Droppable droppableId="droppable-rows-1">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                              {records.map((record, index) => {
                                let deleteRelated:DeleteRelated[];
                                const ids = extractRecursiveIds(record, 'subDocuments');
                                console.log(ids);
                                  return (
                                      <Draggable key={`mdoc-${record._id}-${index}`} draggableId={`mdoc-${record._id}-${index}`} index={index}>
                                          {(provided) => (
                                            <>
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="py-0.5"
                                                >
                                                    <div className='flex justify-between gap-1 items-center'>
                                                        <div className='w-full bg-gray-200 flex justify-between items-center'>
                                                            <span className={`font-medium text-xs flex justify-start items-center gap-1 cursor-pointer
                                                                ${record._id && activeTask.includes(record._id) && 'text-primary '}
                                                            `}
                                                                
                                                            >
                                                                <CustomContextMenu iconSize='xs' text={record.name}> 
                                                                    <ul>
                                                                        <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                                            <div className='flex justify-between items-center text-xs gap-1 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words'
                                                                            data-close-menu='true'
                                                                            onClick={()=>{setParentData(record); setFormData(initialFormData); setFormAction('add')}}
                                                                            >
                                                                                {t('addSubSection')} <MdAdd />
                                                                            </div>
                                                                        </li>
                                                                        <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                                            <div className='flex justify-between items-center text-xs gap-1 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words'
                                                                            data-close-menu='true'
                                                                            onClick={()=>{setParentData(record); setFormData(record); setFormAction('update')}}
                                                                            >
                                                                                {t('update')} <MdEdit />
                                                                            </div>
                                                                        </li>
                                                                        <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                                            <DeleteById text={t('delete')} data={{id:record._id || '', type:'documentation', page:"documentation"}} 
                                                                            data-close-menu='true'
                                                                            deleteRelated={ids && ids.length >0 ?  deleteRelated=[{collection:'documentation', ids:ids}] : []}
                                                                            content={`Delte Project: ${record.name}`} 
                                                                            onYes={onDelete}/>
                                                                        </li>
                                                                    </ul>
                                                                </CustomContextMenu>
                                                            </span>
                                                            {record.subDocuments && record.subDocuments.length > 0 && 
                                                                <div onClick={()=> handleTaskClick(record._id || '')}
                                                                className={`bg-transparent hover:bg-primary-light cursor-pointer`}
                                                                >
                                                                    <MdChevronRight className={`${record._id && activeTask.includes(record._id) ? '-rotate-90' : 'rotate-90'}
                                                                        transition-transform duration-200 ease
                                                                        `} 
                                                                        
                                                                        /> 
                                                                </div>
                                                            }
                                                            </div>
                                                    </div>
                                                    {record.subDocuments && record.subDocuments.length > 0 && 
                                                    <DragDropContext onDragEnd={handleDrag}>
                                                    <Droppable droppableId="droppable-rows-1">
                                                        {(provided) => (
                                                        <div {...provided.droppableProps} ref={provided.innerRef}  className={` ml-2 
                                                            overflow-hidden transition-all duration-200
                                                                ${record._id && activeTask.includes(record._id) ? 'h-auto border-l-2 border-primary' : 'h-0'}
                                                            `}>
                                                            {record.subDocuments && record.subDocuments.length && record.subDocuments.map((subtaskL1,index1) => {
                                                                const subtask1 = subtaskL1 as unknown as Documentation;
                                                                const ids1 = extractRecursiveIds(subtask1, 'subDocuments');
                                                                return (
                                                                    <Draggable key={`mdoc-${subtask1._id}-${index1}`} draggableId={`mdoc-${subtask1._id}-${index1}`} index={index1}>
                                                                        {(provided) => (
                                                                            <>
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            
                                                                            >
                                                                            <div  className='flex justify-between gap-1 items-center'>
                                                                                
                                                                            <span className={`font-normal text-xs flex justify-start items-center gap-1 cursor-pointer
                                                                                    ${subtask1._id && activeTask.includes(subtask1._id)  && 'text-primary'}
                                                                                `}
                                                                                
                                                                                >
                                                                                <CustomContextMenu iconSize='xs' text={subtask1.name}>  
                                                                                    <ul>
                                                                                        <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                                                            <div className='flex justify-between items-center text-xs gap-1 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words'
                                                                                            data-close-menu='true'
                                                                                            onClick={()=>{setParentData(subtask1); setFormData(initialFormData); setFormAction('add')}}
                                                                                            >
                                                                                                {t('addSubSection')} <MdAdd />
                                                                                            </div>
                                                                                        </li>
                                                                                        <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                                                            <div className='flex justify-between items-center text-xs gap-1 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words'
                                                                                            data-close-menu='true'
                                                                                            onClick={()=>{setParentData(subtask1); setFormData(subtask1); setFormAction('update')}}
                                                                                            >
                                                                                                {t('update')} <MdEdit />
                                                                                            </div>
                                                                                        </li>
                                                                                        <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                                                            <DeleteById text={t('delete')} data={{id:subtask1._id || '', type:'documentation', page:"documentation"}} 
                                                                                            data-close-menu='true'
                                                                                            deleteRelated={ids1 && ids1.length >0 ?  deleteRelated=[{collection:'documentation', ids:ids1}] : []}
                                                                                            content={`Delte Project: ${subtask1.name}`} 
                                                                                            onYes={onDelete}/>
                                                                                        </li>
                                                                                    </ul>
                                                                                </CustomContextMenu>
                                                                                    
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
                                                                            {subtask1.subDocuments && subtask1.subDocuments.length > 0 &&
                                                                            <DragDropContext onDragEnd={handleDrag}>
                                                                                <Droppable droppableId="droppable-rows-1">
                                                                                    {(provided) => (
                                                                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                                                                        {subtask1.subDocuments && subtask1.subDocuments.length > 0 && subtask1.subDocuments.map((subtaskL2, index2) => {
                                                                                            const subtask2 = subtaskL2 as unknown as Documentation;
                                                                                            const ids2 = extractRecursiveIds(subtask2, 'subDocuments');
                                                                                            return (
                                                                                                <Draggable key={`mdoc-${subtask2._id}-${index2}`} draggableId={`mdoc-${subtask2._id}-${index2}`} index={index2}>
                                                                                                    {(provided) => (
                                                                                                        <>
                                                                                                    <div
                                                                                                        ref={provided.innerRef}
                                                                                                        {...provided.draggableProps}
                                                                                                        {...provided.dragHandleProps}
                                                                                                        className={` ml-2
                                                                                                            ${subtask1._id && activeTask.includes(subtask1._id )? 'h-auto border-l-2 border-primary' : 'h-0 opacity-0'}
                                                                                                            `}
                                                                                                    >
                                                                                                    <div className='flex justify-between gap-1 items-center'>
                                                                                                            <span className={`font-normal text-xs flex justify-start items-center gap-1 cursor-pointer
                                                                                                                ${subtask2.subDocuments && subtask2.subDocuments.length > 0 && ''}
                                                                                                            `}
                                                                                                                
                                                                                                            >
                                                                                                                <CustomContextMenu iconSize='xs' text ={subtask2.name}> 
                                                                                                                    <ul>
                                                                                                                        {/* <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                                                                                            <div className='flex justify-between items-center text-xs gap-1 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words'
                                                                                                                            onClick={()=>{setParentData(subtask2); setFormData(initialFormData)}}
                                                                                                                            >
                                                                                                                                {t('addSubSection')} <MdAdd />
                                                                                                                            </div>
                                                                                                                        </li> */}
                                                                                                                        <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                                                                                            <div className='flex justify-between items-center text-xs gap-1 hover:bg-primary-light hover:text-primary cursor-pointer whitespace-normal break-words'
                                                                                                                            data-close-menu='true'
                                                                                                                            onClick={()=>{setParentData(subtask2); setFormData(subtask2); setFormAction('update')}}
                                                                                                                            >
                                                                                                                                {t('update')} <MdEdit />
                                                                                                                            </div>
                                                                                                                        </li>
                                                                                                                        <li className='px-1 py-1 my-1 hover:bg-slate-100'>
                                                                                                                            <DeleteById text={t('delete')} data={{id:subtask2._id || '', type:'documentation', page:"documentation"}} 
                                                                                                                            data-close-menu='true'
                                                                                                                            deleteRelated={ids2 && ids2.length >0 ?  deleteRelated=[{collection:'documentation', ids:ids2}] : []}
                                                                                                                            content={`Delte Project: ${subtask2.name}`} 
                                                                                                                            onYes={onDelete}/>
                                                                                                                        </li>
                                                                                                                    </ul>
                                                                                                                </CustomContextMenu>
                                                                                                            </span>
                                                                                                        </div> 
                                                                                                    </div>
                                                                                                    </>
                                                                                                    )
                                                                                                        
                                                                                                }
                                                                                                </Draggable>
                                                                                                )}
                                                                                        )}
                                                                                        {provided.placeholder}
                                                                                    </div>
                                                                                    )}
                                                                                </Droppable>
                                                                            </DragDropContext>
                                                                            }
                                                                        </div>
                                                                        </>
                                                                        )
                                                                        
                                                                    }
                                                                    </Draggable>
                                                                    )}
                                                            )}
                                                            {provided.placeholder}
                                                        </div>
                                                        )}
                                                    </Droppable>
                                                    </DragDropContext>
                                                    }
                                                </div>
                                            </>
                                          )}
                                      </Draggable>
                                      )}
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    
                    
                    }    


                    {/* New documentation ends */}
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 p-4 transition-all ease duration-200 ${isSidebarOpen ? 'ml-60' : 'ml-0'}`}>
                <button
                    onClick={toggleSidebar}
                    className={`fixed -translate-y-4 border
                        -translate-x-4  text-parimary-dark p-2 flex justify-center items-center text-xl
                        rounded-sm hover:bg-primary-light transition-colors duration-200 bg-white
                        `}
                >
                    {isSidebarOpen ? <MdClose /> : <MdMenu /> }
                </button>

                <div className={`mt-10 flex flex-col justify-center pb-8`}>
                    <div className='mb-3 flex justify-between items-center max-w-4xl'>
                        {parentData && 
                            <PageTitel text={`${parentData.name} ${!formData.name ? '/ '  : ''}`} color='primary' size='2xl'/> 
                        }
                        {!formData.name && 
                            <PageTitel text={parentData ? `${t('newSection')}` : t('newSection')} color='slate-300' 
                            size={'2xl'}
                            />
                        }
                        <ToggleSwitch 
                            yesText={`${t('public')}`} yesValue='public'
                            noText={t('private')} size='xs' noValue='private'
                        onChange={(isChecked, value)=>handlePrivacy(isChecked, value)}  initialState={formData.privacy === 'public' ? true : false}/> 
                    </div>
                    <div className='flex flex-col gap-4'>
                        <div className='card bg-white max-w-4xl'> 
                            <div>
                                <CustomInput type='text' name='name' label={t('name')} value={formData.name}
                                    onChange={(e)=>handleInputChange('name', e.target.value)}
                                />
                                <RichtTextEditor value={formData.description || ''} onChange={(value)=>handleInputChange('description', value)}/>
                            </div>
                        </div>
                        {formData.customFields && formData.customFields.length > 0 &&  formData.customFields.map((cf, index)=>{
                            return (
                                <div className='relative card bg-white max-w-4xl' key={`cf-${index}`}>
                                    <CustomSmallButton size='sm' position='absolute' type='remove' onClick={()=>addRemoveCustomField(index)}/>

                                    <CustomInput type='text' name='name' label={t('name')} value={cf.name}
                                        onChange={(e)=>updateCustomField(index, 'name', e.target.value)}
                                    />
                                    <RichtTextEditor value={cf.value || ''} onChange={(value)=>updateCustomField(index, 'value', value)}    
                                    />

                                </div>
                            )
                        })
                        }
                    </div>  
                    <div className="mt-6 text-right fixed bottom-6 flex right-6 flex flex-cols gap-4">
                        <CustomSmallButton  type='add' size="sm" position='absolute' text={t('addCustomField')} onClick={()=>addRemoveCustomField(-1)} />
                        <FormButton  btnText={formAction === 'update' ? t('update') : t('create')}  onClick={()=>saveData()}/>
                    </div>
                </div>
            </div>
        </div>

        <CustomAlert
          onClose={() => setAlertData({ ...alertData, isOpen: !alertData.isOpen })}
          isOpen={alertData.isOpen}
          content={alertData.content}
          title={alertData.title}
          type={alertData.type || 'info'} 
        />

        <FlashPopup isOpen={flashPopupData.isOpen} message={flashPopupData.message} onClose={()=>setFlashPopupData({...flashPopupData, isOpen:false})} type={flashPopupData.type || 'info'}/>


    </div>
  )
}

export default DocumentationsForm
