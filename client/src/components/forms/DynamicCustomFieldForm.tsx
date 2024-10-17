import { DynamicCustomField } from '@/interfaces';
import React, { useState } from 'react'
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
}

const DynamicCustomFieldForm:React.FC<ArgsType> = ({
    name="", action="add", data={name:'', value:''}, onSubmit
}) => {
    const {t} = useTranslation();
    const [fieldData, setFieldData] = useState<DynamicCustomField>(data);

    const handleSubmit=()=>{
      onSubmit(name, fieldData);
    }

  return (
    <div>
      <div>
        <CustomInput name='name' onChange={(e)=>setFieldData({...fieldData, name:e.target.value})} 
          label={t('FORMS.name')}
          />
      </div>
      <div>
        <RichTextArea onChange={(name, value)=>setFieldData({...fieldData, value:value})} 
            label={t('FORMS.description')}
        />
      </div>
      <div className='' onClick={handleSubmit}>
      <CustomSmallButton
            type={action == 'add' ? 'add' : 'update'}
            onClick={handleSubmit}
          />
      </div>
    </div>
  )
}

export default DynamicCustomFieldForm
