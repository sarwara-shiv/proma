import { DynamicField } from '@/interfaces'
import React, { useState } from 'react'
import CustomInput from './CustomInput';
import { useTranslation } from 'react-i18next';
import CustomDropdown from './CustomDropdown';
import { DynamicFieldsTypes } from '../../config/predefinedDataConfig';
import EnterInput from './EnterInput';
import CustomSmallButton from '../common/CustomSmallButton';
import { IoMdClose } from 'react-icons/io';

interface ArgsType{
  onChange:(value:DynamicField)=>void;
  selectedData?:DynamicField;
  action?: 'add' | 'update';
}

const emptyFields:DynamicField={
  key:'',
  type:'string',
  value:''
}



const CustomFieldForm:React.FC<ArgsType> = ({onChange, selectedData}) => {
  const {t} = useTranslation();
  const [newDynamicField, setNewDynamicField] = useState<DynamicField>(selectedData || emptyFields);
  
  const handleInputs = (field:keyof DynamicField, value:any)=>{
    if(field === 'key' || field ==='type'){
      setNewDynamicField({...newDynamicField, value:'', [field]:value});
    }
    if(field === 'value'){
      if(newDynamicField.type === 'dropdown'){
        console.log(field, value);
        setNewDynamicField(prevVal=>{
          let nvals = prevVal.value;
          if(prevVal.value && Array.isArray(prevVal.value)){
            nvals = [...nvals, value];
          }else{
            nvals = [value];
          }
          console.log(nvals);
          return {...prevVal, value:nvals}
        })
      }
    }
  }

  const removeArrayValues = (index:number, value:string)=>{
    setNewDynamicField(prevVal=>{
      let nvals = prevVal.value;
      if(prevVal.value && Array.isArray(prevVal.value) && prevVal.value.length > 0){
        nvals = prevVal.value.filter((d,i)=>{
          if(i !== index && d !== value){
            return d
          }
        })
      }
      console.log(nvals);
      return {...prevVal, value:nvals}
    })
  }

  const handleSubmit = ()=>{
    console.log(newDynamicField);
    onChange && onChange(newDynamicField);
  }
  
  return (
    <div>
      <div>
        <CustomInput name="key" label={t('FORMS.fieldName')}  onChange={(e)=>handleInputs('key', e.target.value)}/>
      </div>
      <div>
        <CustomDropdown name="key" label={t('FORMS.type')}  selectedValue={newDynamicField.type} data={DynamicFieldsTypes} onChange={(recordId, name, value, data)=>handleInputs('type', value)}/>
      </div>
      {newDynamicField.type && newDynamicField.type === 'dropdown' && 
        <div className='mt-4'>
          <div>
            <span className='text-gray-400 text-sm'>Values</span>
            <div>
              {newDynamicField.value && 
              <div className='flex justify-start'>
                {newDynamicField.value && Array.isArray(newDynamicField.value) && (newDynamicField.value as unknown as string[]).map((d, i)=>{
                  return (
                    <div 
                    className='relative bg-green-100 rounded-md pt-1 pb-1 pl-2 pr-2 text-xs flex mx-1 my-1.5'
                    >{d}
                      <span
                      onClick={()=>removeArrayValues(i,d)}
                      className='absolute top-[-5px] right-0 text-red-500 cursor-pointer'
                      ><IoMdClose/> </span>
                    </div>
                  )
                })}
              </div>
              }
            </div>
          </div>
          <EnterInput name="value" onEnter={({name, value})=>handleInputs('value', value)}/>
        </div>
      }
      <div className='mt-4 flex justify-end'>
          <CustomSmallButton type='add' onClick={handleSubmit} text='Save'/>
      </div>

      
    </div>
  )
}

export default CustomFieldForm
