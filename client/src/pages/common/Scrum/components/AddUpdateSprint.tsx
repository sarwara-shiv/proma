import { useTranslation } from "react-i18next"
import { ISprint, Project } from "../../../../interfaces"
import { ObjectId } from "mongodb";
import { act, useEffect, useState } from "react";
import { CustomInput, CustomSelectList, RichTextArea } from "../../../../components/forms";
import { FormButton, ToggleSwitch } from "../../../../components/common";
import CustomDateTimePicker2 from "../../../../components/forms/CustomDateTimePicker";
import moment from 'moment';
import { addUpdateRecords } from "../../../../hooks/dbHooks";
import { useAuthContext } from "../../../../context/AuthContext";
import { addWorkingHours } from "../../../../utils/dateUtils";

interface ArgsType {
    sprint?:ISprint,
    projectId:string|ObjectId|null,
}

const edata:ISprint = {
    name:'',
    _pid:'',
    backlog:[],
    expectedTime:0,
    isActive:false
}

const AddUpdateSprint:React.FC<ArgsType> = ({sprint, projectId}) => {
    const {t} = useTranslation();
    const {user} = useAuthContext();
    const [pid,setPid] = useState<string|ObjectId>(projectId ? projectId : '');
    const [action, setAction] = useState<"add"|"update">('add');
    const [formData, setFormData] = useState<ISprint>(sprint ? sprint : edata);
    
    useEffect(()=>{
        if(projectId){
            const _pid = projectId as unknown as string;
            console.log(_pid);
            setFormData({...formData, _pid});
        }

        if(sprint){
            setAction('update');
        }
    },[])

    // HANDLE INPUT
    const handleInputs = (name:string,value:string|boolean|Date|number)=>{
        if(name ){
            if(name === 'expectedTime'){
                let nValue = value;
                if(typeof value === 'string' || typeof value === 'number'){
                    if(typeof value === 'string') {
                        nValue = parseInt(value);
                    }else{
                        nValue = value;
                    }

                    setFormData({...formData, expectedTime:nValue});
                    if(formData.startDate){
                        const endDate = addWorkingHours(formData.startDate, nValue);
                        setFormData({...formData, endDate});
                    }
                }
            }else{
                setFormData({...formData, [name]:value});
            }
        }
    }
    // HANDLE INPUT
    const handleSubmitForm = async()=>{
        console.log(formData);
        if (!formData?._pid && !pid) {
            console.warn('Project ID not found');
            return;
          }
        
          if (!formData.name) {
            console.warn('Name is required');
            return;
          }
        
          const { startDate, endDate } = formData;
        
          if (!startDate || !endDate || moment(endDate).diff(moment(startDate)) < 0) {
            console.warn('Please add valid dates');
            return;
          }
        
        try{
            if(user && user._id){
                setFormData({...formData, createdBy:user._id })
            }
            let sid = '';
            if(action === 'update' && formData._id){
                sid = formData._id;
            }
            const res = await addUpdateRecords({type:'sprints', id:sid, action, body:{...formData, _pid:pid}});
            if(res && res.status ==='success' && res.code === 'record_added'){
                setAction('update');
                setFormData(res.data);
                console.log('updated');
            }
        }catch(error){  
            console.error(error);
        }
    }

    return <div className="flex justify-center items-center p-1 bg-white">
        <div className="w-full">
            {action === 'update' && formData._cid && 
            <span>{formData._cid}</span>
            }
            <div className='fields-wrap grid grid-cols-[1fr_auto] gap-4 mb-6'>
              <div className='w-full'>
                <input name='name' type='text' placeholder={t('FORMS.name')} value={formData.name} required 
                  onChange={(e)=>handleInputs(e.target.name, e.target.value)}
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
                    <ToggleSwitch onChange={(isChecked, value)=>handleInputs('isActive', isChecked)} label={'Active?'} 
                    initialState={formData.isActive ? true : false}
                    /> 
                </div>
            </div>
            <div className='fields-wrap flex gap-4 mb-6'>
                <div className=''>
                    <CustomDateTimePicker2 name="startDate" selectedDate={formData.startDate? formData.startDate : new Date()}
                        onChange={(rid, value, name)=>{value && handleInputs('startDate', value)}}
                        label={t('startDate')}
                    />
                </div>
                {formData.startDate && 
                    <div className="w-16">
                        <CustomInput type="number"  label={t('expectedTime')}
                        onChange={(event)=>{event.target.value && handleInputs('expectedTime', event.target.value)}}/>
                    </div>
                }
                <div className="">
                    <CustomDateTimePicker2 name="endDate" selectedDate={formData.endDate? formData.endDate : new Date()}
                        onChange={(rid, value, name)=>{value && handleInputs('endDate', value)}}
                        label={t('endDate')}
                    />
                </div>
            </div>
            <div className='fields-wrap grid grid-cols-1 gap-4 mb-6'>
                <div className='w-full'>
                    <RichTextArea name="goal" defaultValue={formData.goal} 
                        onChange={(name, value)=>handleInputs(name, value)}
                        label={t('goal')}
                    />    
                </div>
            </div>
            <div className="text-right">
                <FormButton onClick={handleSubmitForm} 
                btnText={action === 'update' && formData._cid ? t('update') : t('add')} />
            </div>
        </div>
    </div>
}

export default AddUpdateSprint