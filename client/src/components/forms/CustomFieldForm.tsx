import { DynamicField } from '@/interfaces'
import React, { useState } from 'react'
import CustomInput from './CustomInput';
import { useTranslation } from 'react-i18next';
import CustomDropdown from './CustomDropdown';
import { DynamicFieldsTypes } from '../../config/predefinedDataConfig';
import EnterInput from './EnterInput';
import CustomSmallButton from '../common/CustomSmallButton';
import { IoMdClose } from 'react-icons/io';
import ColorPicker from '../common/ColorPicker';

interface ArgsType{
  onChange:(value:DynamicField, index:number|null)=>void;
  selectedData?:DynamicField;
  action?: 'add' | 'update';
  index?:number | null;
}

const emptyFields:DynamicField={
  key:'',
  type:'string',
  value:'',
  selectedValue:''
}



const CustomFieldForm:React.FC<ArgsType> = ({onChange, selectedData, index=null}) => {
  const {t} = useTranslation();
  const [newDynamicField, setNewDynamicField] = useState<DynamicField>(selectedData || emptyFields);
  
  // HANDLE FIELDS SELECTION
  const handleInputs = (field:keyof DynamicField, value:any, color:string | null)=>{
    if(field === 'key'){
      setNewDynamicField({...newDynamicField,[field]:value});
    }
    if(field ==='type'){
      setNewDynamicField({...newDynamicField,value:'', [field]:value});
    }
    if(field === 'value'){
      if(newDynamicField.type === 'dropdown' || newDynamicField.type === 'status' ){
        console.log(field, value);
        setNewDynamicField(prevVal=>{
          let nvals = prevVal.value;
          if(prevVal.value && Array.isArray(prevVal.value)){
            if(color){
              nvals = prevVal.value.map((d)=>{
                if(d.value === value){
                  d.color = color;
                  return d;
                }
                return d
              })
            }else{
              nvals = [...nvals, {_id:value, color:'default', value, name:value}];
            }
          }else{
            nvals = [{_id:value, color:'default', value, name:value}];
          }
          console.log(nvals);
          return {...prevVal, value:nvals}
        })
      }
    }
  }

  const isValid = ()=>{

    return newDynamicField.key ? 
      newDynamicField.type === 'dropdown' || newDynamicField.type === 'status' ? 
      newDynamicField.value && Array.isArray(newDynamicField.value) && newDynamicField.value.length > 0 ? true : false : true
    : false;
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
    onChange && onChange(newDynamicField, index);
  }
  
  return (
    <div>
      <div>
        <CustomInput name="key" label={t('FORMS.fieldName')}  value={newDynamicField.key} onChange={(e)=>handleInputs('key', e.target.value, null)}/>
      </div>
      <div className={`${index !== null && index >=0 ? 'hidden': ''}`}>
        <CustomDropdown name="key" label={t('FORMS.type')}  selectedValue={newDynamicField.type} data={DynamicFieldsTypes} onChange={(recordId, name, value, data)=>handleInputs('type', value, null)}/>
      </div>
      {newDynamicField.type && (newDynamicField.type === 'dropdown' || newDynamicField.type === 'status' ) && 
        <div className='mt-4'>
          <div>
            <span className='text-gray-400 text-sm'>Values</span>
            <div>
              {newDynamicField.value && 
              <div className='flex justify-start flex-wrap'>
                {newDynamicField.value && Array.isArray(newDynamicField.value) && (newDynamicField.value as unknown as string[]).map((d, i)=>{
                  const vals:{color:string, value:string} = d as unknown as {color:string, value:string}; 
                  return (
                    <div 
                    className={`relative rounded-md pt-1 pb-1 px-1 text-xs flex mx-1 my-1.5  border
                        justify-center items-center
                        bg-${vals.color} text-${vals.color}-dark
                      `}
                    >
                      <span className='pr-1'>
                        <ColorPicker selectedColor={vals.color} 
                        onSelect={(color)=>handleInputs('value', vals.value, color)} />
                      </span>
                      {vals.value}

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
          <EnterInput name="value" onEnter={({name, value})=>handleInputs('value', value, null)}/>
        </div>
      }
      <div className='mt-4 flex justify-end'>
          <CustomSmallButton disable={!isValid()} type={index !== null && index >=0 ? 'update': 'add'} onClick={handleSubmit} text={index !== null && index >=0 ? `${t('updae')}`: `${t('add')}`}/>
      </div>

      
    </div>
  )
}

export default CustomFieldForm
