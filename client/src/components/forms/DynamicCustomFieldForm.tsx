import { DynamicCustomField } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import CustomInput from './CustomInput';
import { useTranslation } from 'react-i18next';
import RichTextArea from './RichTextArea';
import { IoMdAdd } from 'react-icons/io';
import CustomSmallButton from '../common/CustomSmallButton';

interface ArgsType{
    name?:string;
    action?:'add' | 'update';
    data?:DynamicCustomField
    onSubmit:(name:string, data:DynamicCustomField)=>void 
    removeEdit?:()=>void
}

const DynamicCustomFieldForm:React.FC<ArgsType> = ({
    name="", action="add", data={name:'', value:''}, onSubmit, removeEdit
}) => {
    const {t} = useTranslation();
    const [fieldData, setFieldData] = useState<DynamicCustomField>({});

    const handleSubmit=()=>{
      onSubmit(name, fieldData);
    }
    const removeEditClick=()=>{
      setFieldData({});
      removeEdit && removeEdit();
    }

    useEffect(()=>{
      console.log(data);
      setFieldData(data);
    },[data])

    const isObjectEmpty = (obj: Record<string, any>): boolean => {
      return Object.entries(obj).length === 0 && obj.constructor === Object;
    };

  return (
    <div>
      <div>
        <CustomInput name='name' onChange={(e)=>setFieldData({...fieldData, name:e.target.value})} 
          label={t('FORMS.name')} value={fieldData && fieldData.name && fieldData.name}
          />
      </div>
      <div>
        <RichTextArea onChange={(name, value)=>setFieldData({...fieldData, value:value})} 
            label={t('FORMS.description')} defaultValue={fieldData && fieldData.value && fieldData.value}
        />
      </div>
      <div 
        className='flex justify-end mt-3 gap-2' 
        onClick={handleSubmit}>
          {data && !isObjectEmpty(data) &&
          <CustomSmallButton
          type={'delete'}
          onClick={removeEditClick}
        />
          }
        <CustomSmallButton
            type={data && !isObjectEmpty(data) ? 'update' : 'add'}
            onClick={handleSubmit}
          />
      </div>
    </div>
  )
}

export default DynamicCustomFieldForm
