import { CustomDropdown } from '../../../../components/forms';
import { ApprovalStatus } from '../../../../config/predefinedDataConfig';
import { KickoffApproval, User } from '@/interfaces'
import { ObjectId } from 'mongodb';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import CustomSmallButton from '../../../../components/common/CustomSmallButton';
import MentionUserInput from '../../../../components/forms/MensionUserInput'; 
interface ArgsType{
    defaultValue?:KickoffApproval | null;
    index?:number;
    onSubmit?:(data:KickoffApproval, index:number)=>void
}

const initialValue:KickoffApproval={
    user:null, status:'inReview'
}

const ApprovalForm:React.FC<ArgsType> = ({
    defaultValue={user:null, status:'inReview'}, index=-1, onSubmit
}) => {
    const {t} = useTranslation();
    const [formData, setFormData] = useState<KickoffApproval>(defaultValue||initialValue);
    const [selectedUser, setSelectedUser] = useState<User|null>(null);

    const handleInputChange = (name:string, value:User | string | ObjectId)=>{
        if(name && value){
            name==='user' && setSelectedUser(value as unknown as User)
            setFormData({...formData, [name]:name === 'status' ? value : (value as unknown as User)})
        }
    }

    const handleSubmit = ()=>{
        onSubmit && onSubmit(formData, index);
    }

  return (
    <div className= "p-2 mb-4 relative">
        <div className='flex flex-col'>
            <div className='mb-4'>
                <label className='text-gray-400 text-sm'>User</label>: 
                {formData.user && (formData.user as unknown as User).name}
                <MentionUserInput type='users' inputType='text' 
                    onClick={(user, data)=>handleInputChange('user', user)}
                />
            </div>
            <div className='mb-4'>
                <CustomDropdown data={ApprovalStatus} selectedValue={formData.status} 
                label={t('status')}
                    onChange={(rid, name, value, data)=>handleInputChange('status', value)}
                />
            </div>
        </div>
        <div className='flex justify-end'>
        <CustomSmallButton
            type={defaultValue ? 'update' : 'add'}
            onClick={handleSubmit}
          />
        </div>
    </div>
  )
}

export default ApprovalForm
