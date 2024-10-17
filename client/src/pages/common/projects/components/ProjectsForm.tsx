import FormsTitle from '../../../../components/common/FormsTitle';
import { CustomInput, CustomSelectList } from '../../../../components/forms';
import { AlertPopupType, DynamicCustomField, FlashPopupType, NavItem, PersonsInvolved, Project } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { ProjectStatuses, Priorities, ProjectType } from '../../../../config/predefinedDataConfig';
import CustomDropdown from '../../../../components/forms/CustomDropdown';
import PersonsInvolvedForm from './PersonsInvolvedForm';
import { addUpdateRecords } from '../../../../hooks/dbHooks';
import CustomAlert from '../../../../components/common/CustomAlert';
import FlashPopup from '../../../../components/common/FlashPopup';
import FormButton from '../../../../components/common/FormButton';
import { useAuth } from '../../../../hooks/useAuth';
import { ObjectId } from 'mongodb';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import { formatDate, compareDates, isPastDate } from '../../../../utils/dateUtils';
import RichTextArea from '../../../../components/forms/RichTextArea';
import DynamicCustomFieldForm from '../../../../components/forms/DynamicCustomFieldForm';

interface ArgsType {
  cid?:string | null;
  action?:"add" | "update";
  data?: Project; 
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
const ProjectsForm:React.FC<ArgsType> = ({ action = "add", data, cid, setSubNavItems, navItems }) => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [formData, setFormData] = useState<Project>(data? data : initialValues);
  const [alertData, setAlertData] = useState<AlertPopupType>({ isOpen: false, content: "", type: "info", title: "" });
  const [flashPopupData, setFlashPopupData] = useState<FlashPopupType>({isOpen:false, message:"", duration:3000, type:'success'});


  useEffect(()=>{
    setSubNavItems(navItems)

    ProjectStatuses.map((d)=>{
      d.name = t(`${d.name}`)
      return d;
    })
    Priorities.map((d)=>{
      d.name = t(`${d.name}`)
      return d;
    })

  },[])

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let data = formData;
    try{
      const createdBy = user && user._id ? user._id : null;
      const response = await addUpdateRecords({type: "projects", checkDataBy:checkDataBy, action, id:cid, body:{ ...data, createdBy}}); 
        if (response.status === "success") {
            // const content = action === 'update' ? `${t('dataUpdated')}` : `${t('dataAdded')}`;
            const content = `${t(`RESPONSE.${response.code}`)}`;
            // setAlertData({...alertData, isOpen:true, title:"Success", type:"success", content})
            setFlashPopupData({...flashPopupData, isOpen:true, message:content, type:"success"});
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

  const handlePersonsInvolved = (value:PersonsInvolved[])=>{
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

  const handleProjCustomField = (name:string, data:DynamicCustomField, index:number=-1)=>{
    if(data && data.name && data.value){
      setFormData(prevVal => {
        if(!prevVal) return prevVal;
        let cfd = prevVal.customFields ?  prevVal.customFields : [];
        if(cfd?.length == 0 ){
          cfd.push(data);
        }else{
          const fexists = cfd?.filter((d)=>d.name === data.name);
          if(fexists){
            cfd.push(data);
          }else{
            cfd.push(data);
          }
        }

        return prevVal = {...prevVal, customFields:cfd}

      })
    }
  }

  const removeCustomField = (index:number)=>{
    
  }


  return (
    <div className='content flex justify-center flex-col '>
      <div className="p-4 bg-white shadow-none rounded max-w-screen flex-1">
        <div className='flex flex-row justify-between align-center'>
          <FormsTitle text=  { action==='update' ? t('updateProject') : t('newProject')} classes='mb-3'/> 
        </div>
        <form onSubmit={(e) => submitForm(e)} className=''>
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
          <div className='grid grid-cols-1 sm:grid-cols-1  md:grid-cols-2  lg:grid-cols-4 gap-2'>
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
          <div className='fields-wrap grid grid-cols-1 md:grid-cols-1 gap-2'>
            <div className="mb-4">
                {/* <CustomInput type='textarea' name='description' onChange={handleInputs} label={`${t('description')}`} /> */}
                <RichTextArea onChange={handleRichText} name='description' label={`${t('description')}`} defaultValue={formData.description}/>
                  {/* <ContentEditable /> */}
            </div>
            
          </div>
          <div className='fields-wrap grid grid-cols-1 md:grid-cols-1 gap-2'>
            <div className="mb-4">
                <PersonsInvolvedForm selectedValues={formData.personsInvolved ? formData.personsInvolved : data?.personsInvolved ? data.personsInvolved : []} onChange={handlePersonsInvolved}/>
            </div>
          </div>
          
          <div className='fields-wrap grid grid-cols-1 md:grid-cols-1 gap-2'>
            <div className="mb-4">
               <div>
                  {data?.customFields && data.customFields.length > 0 && data.customFields.map((d, index)=>{
                    const cf = d as unknown as DynamicCustomField;
                    return (
                      <div key={`cf-${index}`} className='p-2 bg-slate-100  rounded-md mb-2'>
                         <div className='text-sm font-bold border-b'>{cf.name}</div> 
                         <div
                            dangerouslySetInnerHTML={{ __html: cf.value || '' }}
                            className="text-sm"
                            />
                      </div>
                    )
                  })}
                </div>   
                <DynamicCustomFieldForm onSubmit={handleProjCustomField}/>
            </div>
          </div>


          <div className="mt-6 text-right">
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



