import FormsTitle from '../../../../components/common/FormsTitle';
import { CustomInput, CustomSelectList } from '../../../../components/forms';
import { PersonsInvolved, Project } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { ProjectStatuses, Priorities } from '../../../../config/predefinedDataConfig';
import CustomDropdown from '../../../../components/forms/CustomDropdown';
import MentionUserInput from '../../../../components/forms/MensionUserInput';
import PersonsInvolvedForm from './PersonsInvolvedForm';

interface ArgsType {
  id?:string | null;
  action?:"add" | "update";
  data?: Project; 
  checkDataBy?:string[];
}
const initialValues: Project = {
  name: '',
  description: '',
  status: 'notStarted',
  priority: 'medium',
  startDate: new Date(),
  documentation: [],
  personsInvolved: [],
  tasks: [],
  customFields: [],
  permissions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const priorityColors=[
  {value:"high", color:"text-red-600 bg-red-100"},
  {value:"medium", color:"text-amber-500 bg-amber-100"},
  {value:"low", color:"text-green-600 bg-green-100"},
  {value:"default", color:"text-yellow-600 bg-yellow-200"}
]


const ProjectsForm:React.FC<ArgsType> = ({ action = "add", data, id }) => {
  const {t} = useTranslation();
  const [formData, setFormData] = useState<Project>(initialValues);

  useEffect(()=>{
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

  }

  const handleInputs = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = event.target;
    setFormData({...formData, [name]:value});
  };

  const handleStatusChange = (name: string, value: string, selectedData: { _id: string, name: string }) => {
    console.log(`Dropdown Name: ${name}`);
    console.log(`Selected Value: ${value}`);
    console.log('Selected Data:', selectedData);

    setFormData({...formData, [name]:value});
  };

  const handlePersonsInvolved = (value:PersonsInvolved[])=>{
    console.log(value);
  }


  return (
    <div className='content flex justify-center flex-col '>
      <div className="p-4 bg-white shadow-none rounded max-w-screen flex-1">
        <div className='flex flex-row justify-between align-center'>
          <FormsTitle text=  { action==='update' ? t('updateProject') : t('newProject')} classes='mb-3'/> 
        </div>
        <form onSubmit={(e) => submitForm(e)} className=''>
          <div className='fields-wrap grid grid-cols-[1fr,200px,200px] gap-4 mb-6'>
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
              <div className=''>
                <CustomDropdown data={ProjectStatuses} label={t('FORMS.status')} name='status'
                  onChange={handleStatusChange}
                />
              </div>
              <div className=''>
                <CustomDropdown data={Priorities} label={t('FORMS.priority')} name='priority'
                  onChange={handleStatusChange} colorClasses={priorityColors}
                />
              </div>
          </div>
          <div className='fields-wrap grid grid-cols-1 md:grid-cols-2 gap-2'>
            <div className="mb-4">
                <PersonsInvolvedForm selectedValues={formData.personsInvolved} onChange={handlePersonsInvolved}/>
            </div>
            <div className="mb-4">
              <MentionUserInput type='text'/>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectsForm



