import FormsTitle from '../../../../components/common/FormsTitle';
import { CustomInput, CustomSelectList } from '../../../../components/forms';
import { AlertPopupType, DynamicCustomField, FlashPopupType, NavItem, PersonsInvolved, Project } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { ProjectStatuses, Priorities, ProjectType } from '../../../../config/predefinedDataConfig';
import CustomDropdown from '../../../../components/forms/CustomDropdown';
import PersonsInvolvedForm from './PersonsInvolvedForm';
import { addUpdateRecords, getRecordWithID } from '../../../../hooks/dbHooks';
import CustomAlert from '../../../../components/common/CustomAlert';
import FlashPopup from '../../../../components/common/FlashPopup';
import FormButton from '../../../../components/common/FormButton';
import {useAuthContext } from '../../../../context/AuthContext';
import { ObjectId } from 'mongodb';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import { formatDate, compareDates, isPastDate } from '../../../../utils/dateUtils';
import RichTextArea from '../../../../components/forms/RichTextArea';
import DynamicCustomFieldForm from '../../../../components/forms/DynamicCustomFieldForm';
import { sanitizeString } from '../../../../utils/commonUtils';
import DeleteSmallButton from '../../../../components/common/DeleteSmallButton';
import { useParams } from 'react-router-dom';
import { PageTitel } from '../../../../components/common';
import CustomSmallButton from '../../../../components/common/CustomSmallButton';

interface ArgsType {
  cid?:string | null;
  action?:"add" | "update";
  navItems:NavItem[];
  setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
  checkDataBy?:string[];
}
const initialValues: Project = {
  name: '',
  description: '',
  status: 'notStarted',
  priority: 'medium',
  projectType:'client',
  startDate: new Date(),
  endDate: new Date(), 
  documentation: [],
  personsInvolved: [],
  tasks: [],
  customFields: [],
  permissions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy:null
};

const priorityColors=[
  {value:"high", color:"text-red-600 bg-red-100"},
  {value:"medium", color:"text-amber-500 bg-amber-100"},
  {value:"low", color:"text-green-600 bg-green-100"},
  {value:"default", color:"text-yellow-600 bg-yellow-200"}
]

const checkDataBy: string[] = ['name'];
const ProjectsForm:React.FC<ArgsType> = ({ action = "add", cid, setSubNavItems, navItems }) => {
  const {t} = useTranslation();
  const {id} = useParams();
  const {user} = useAuthContext();
  const [projectId, setProjectId] = useState<string|ObjectId>(id ? id : '');
  const [formData, setFormData] = useState<Project>(initialValues);
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});
  const [editCField, setEditCField] = useState<DynamicCustomField>({}) 


  useEffect(()=>{
    setSubNavItems(navItems);
    getData();

    ProjectStatuses.map((d)=>{
      d.name = t(`${d.name}`)
      return d;
    })
    Priorities.map((d)=>{
      d.name = t(`${d.name}`)
      return d;
    })

  },[])

  const getData = async()=>{
    try{
      const populateFields = [
          {path: 'personsInvolved'},
      ]

        if(projectId){
            const res = await getRecordWithID({id:projectId, populateFields, type:'projects'});

            if(res.status === 'success' && res.data){
               setFormData({...formData, ...res.data});
               console.log(res.data); 
            }

        }
    }catch(error){
        console.log(error);
    }
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let nData = formData;
    try{
      let body = {...nData};
      action = projectId ? 'update' : 'add';
      const createdBy = user && user._id ? user._id : null;
      if(action === 'add'){
        body = {...body, createdBy}; 
      }

      const response = await addUpdateRecords({type: "projects", checkDataBy:checkDataBy, action, id:cid, body:{ ...body}}); 
        if (response.status === "success") {
            // const content = action === 'update' ? `${t('dataUpdated')}` : `${t('dataAdded')}`;
            const content = `${t(`RESPONSE.${response.code}`)}`;
            // setAlertData({...alertData, isOpen:true, title:"Success", type:"success", content})
            setFlashPopupData({...flashPopupData, isOpen:true, message:content, type:"success"});
            console.log(response.data);
            setFormData({...formData, ...response.data});
        } else {
          let content = `${t(`RESPONSE.${response.code}`)}`
          if(response.data){
            content = Object.entries(response.data).map(([key, value]) => {
                return value && `${key} exists`;
            }).filter(Boolean).join(', ');
          }
          setAlertData({...alertData, isOpen:true, title:"Fail", type:"fail", content});
          console.error('Error:', response.message, 'Code:', response.code);
        }
    }catch(error){
      console.log(error);
    }
  }

  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = event.target;
    setFormData({...formData, [name]:value});
  };

  const handleRichText = (name:string, value:string) => {
    if(name && value)
    setFormData({...formData, [name]:value});
  };

  const handleStatusChange = (recordId:string|ObjectId, name: string, value: string, selectedData: { _id: string, name: string }) => {
    setFormData({...formData, [name]:value}); 
  };

  const handlePersonsInvolved = (value:(string|ObjectId)[])=>{
    setFormData({...formData, personsInvolved:value});
  }

  const handleDateChange = (recordId:string|ObjectId, date: Date | null, name:string)=>{
    if(name && date){
      let saveDate = 0;
      const nDate = formatDate(date);
      const oDateName = name === 'startDate' ? 'endDate' : 'startDate';
      const oDate = formData[oDateName];
      if(name === 'endDate' && oDate){
        const noDate = formatDate(oDate);
        console.log(noDate);
        saveDate = compareDates(date, oDate); // -1 means end date is less then startDate, 0 means equal so no save;
      }
      if(name === 'startDate' && oDate){
        const noDate = formatDate(oDate);
        console.log(noDate);
        saveDate = compareDates(oDate, date); // -1 means end date is less then startDate, 0 means equal so no save;
      }

      if(saveDate > 0){
        setFormData({...formData, [name]:date});
      }else{
        setAlertData({...alertData, type:"error", content:`${t('endDateBiggerThanStartDate')}`, isOpen:true})
      }

    }
  }

  const handleProjectType = (value:string | string[])=>{
    console.log(value);
    if (typeof value === 'string' || value instanceof String)
    setFormData({...formData, projectType:value === 'inhouse' ? 'inhouse' : 'client'});
  }

  const handleProjCustomField = (name: string, fieldsData: DynamicCustomField, index: number = -1) => {
    if (fieldsData && fieldsData.name && fieldsData.value) {
      setFormData((prevVal) => {
        if (!prevVal) return prevVal;
  
        let cfd = prevVal.customFields ? prevVal.customFields : []; 
        
        if(fieldsData.name){
          // Format the name to lowercase and remove spaces
          const formattedName = sanitizeString(fieldsData.name ? fieldsData.name : '');
    
          // Check if the custom field already exists
          const fieldIndex = cfd.findIndex(
            (d) => d.name && sanitizeString(d.name) === formattedName
          );
    
          if (fieldIndex !== -1) {
            // Field exists, update its value
            cfd[fieldIndex].value = fieldsData.value;
          } else {
            // Field doesn't exist, add new field
            cfd.push(fieldsData);
          }
        }
  
        // Return the updated formData
        return { ...prevVal, customFields: cfd };
      });
    }
  };
  

  const removeCustomField = (index: number) => {
    console.log(index);
    setFormData((prevVal) => {
      if (!prevVal || !prevVal.customFields) return prevVal;
  
      // Create a copy of the current customFields array
      const updatedCustomFields = [...prevVal.customFields];
      // Remove the field at the given index
      console.log(updatedCustomFields);
      updatedCustomFields.splice(index, 1);
  
      // Return the updated formData with the custom field removed
      return { ...prevVal, customFields: updatedCustomFields };
    });
  };


  return (
    <div className='content flex justify-center flex-col '>
      <div className="shadow-none rounded max-w-screen flex-1">
        {/* <div className='flex flex-row justify-between align-center'>
          <FormsTitle text=  { action==='update' ? t('updateProject') : t('newProject')} classes='mb-3'/> 
        </div> */}
        <form onSubmit={(e) => submitForm(e)} className=''>
          <div className='card bg-white'>

            <div className='fields-wrap grid grid-cols-[1fr_auto] gap-4 mb-6'>
              <div className='w-full'>
                <input name='name' type='text' placeholder={t('FORMS.projectName')} value={formData.name} required 
                  onChange={handleInputs}
                  className={`placeholder-slate-300 
                    w-full
                    text-lg 
                    text-primary
                    font-semibold 
                    border-b
                    p-2.5
                    border-slate-200
                    focus:outline-none 
                    focus:border-b
                    `}
                    />
                </div>

                <div className="">
                  <CustomSelectList name="projectType" label={t('projectType')} inputType='radio' data={ProjectType} selectedValue={formData.projectType} onChange={handleProjectType}/>
                </div>
            </div>
          </div>
          <div className='card bg-white grid grid-cols-1 sm:grid-cols-1  md:grid-cols-2  lg:grid-cols-4 gap-2'>
                  <div className="w-full">
                    <CustomDateTimePicker
                        selectedDate={formData.startDate}
                        onDateChange={handleDateChange}
                        showTimeSelect={false}
                        name="startDate"
                        label={t('startDate')}
                      />
                  </div>
                  <div className="w-full">
                    <CustomDateTimePicker
                        selectedDate={formData.endDate || null}
                        onDateChange={handleDateChange}
                        showTimeSelect={false}
                        name="endDate"
                        label={t('endDate')}
                      />
                </div>
                <div className=''>
                  <CustomDropdown data={ProjectStatuses} label={t('FORMS.status')} name='status'
                    onChange={handleStatusChange} selectedValue={formData.status}
                  />
                </div>
                <div className=''>
                  <CustomDropdown data={Priorities} label={t('FORMS.priority')} name='priority'
                    onChange={handleStatusChange} colorClasses={priorityColors} selectedValue={formData.priority} 
                  />
                </div>
            </div>
          <div className='card bg-white fields-wrap grid grid-cols-1 md:grid-cols-1 gap-2'>
            <div className="mb-4">
                {/* <CustomInput type='textarea' name='description' onChange={handleInputs} label={`${t('description')}`} /> */}
                <RichTextArea onChange={handleRichText} name='description' label={`${t('description')}`} defaultValue={formData.description}/>
                  {/* <ContentEditable /> */}
            </div>
          </div>
          <div className='fields-wrap grid grid-cols-1 md:grid-cols-1 gap-2'>
            <div className="mb-4">
                
            </div>
          </div>
          
          <div className='card bg-white fields-wrap grid grid-cols-1 md:grid-cols-1 gap-2'>
            <div className='text-left mb-3'>
                <PageTitel text={`${t('FORMS.customFields')}`} color='slate-300'  size='2xl'/>
              </div>
            <div className="mb-4">
               <div>
                  {formData?.customFields && formData.customFields.length > 0 && formData.customFields.map((d, index)=>{
                    const cf = d as unknown as DynamicCustomField;
                    return (
                      <div key={`cf-${index}`} className='p-2 border mb-3 rounded-md mb-2'
                      >
                        <div className='relative flex justify-between items-center text-sm'>
                         <div className='text-md font-bold py-1 mb-1 w-full relative text-slate-600
                         bg-slate-100 px-2 flex justify-between
                         ' 
                         >
                          <div>
                            {cf.name}
                          </div>
                          <div className='relative flex flex-cols gap-2'>
                            {!editCField || editCField.name !== cf.name && 
                              <CustomSmallButton type='update' onClick={() => {setEditCField({...editCField, ...d})}} position='relative'/>
                            }
                            <CustomSmallButton type='delete' onClick={() => {setEditCField({});  removeCustomField(index)}} position='relative'/>
                          </div>
                         </div>
                         
                        </div>
                         <div
                            dangerouslySetInnerHTML={{ __html: cf.value || '' }}
                            className="text-xs text-slate-400 px-2"
                            />
                      </div>
                    )
                  })}
                </div> 
                <div className='my-2 bg-slate-100 p-2 rounded-md
                '>
                  <div className=''>
                    <DynamicCustomFieldForm onSubmit={handleProjCustomField} data={editCField} 
                      removeEdit = {()=>setEditCField({})} 
                    />
                  </div>  
                </div>
            </div>
          </div>


          <div className="fixed right-2 bottom-2 mt-6 text-right"> 
            <FormButton  btnText={action === 'update' ? t('update') : t('create')} />
          </div>
        </form>
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

export default ProjectsForm



