import { Milestone } from '@/interfaces';
import React, { useEffect, useState } from 'react'
import CustomInput from './CustomInput';
import { useTranslation } from 'react-i18next';
import CustomDateTimePicker from './CustomDatePicker';
import CustomDropdown from './CustomDropdown';
import { milestoneStatuses } from '@/config/predefinedDataConfig';
import CustomSmallButton from '../common/CustomSmallButton';
interface ArgsType {
    milestone: Milestone | null;
    index?: number | null;
    change? : 'all' | 'date' | 'name';
    onChange: (index:number | null, value: Milestone | null) => void;
  }
const emptyMilestoneData:Milestone={
    name:'',
    dueDate:null,
    status:'notStarted'
}
const MilestonesForm:React.FC<ArgsType> = ({milestone=null, index=null, onChange, change='status'}) => {
    const [milestoneData, setMilestoneData] = useState<Milestone>(emptyMilestoneData);
    const {t} = useTranslation();
    useEffect(()=>{
        if(milestone) setMilestoneData(milestone)
        else setMilestoneData(emptyMilestoneData)
    },[])

    const handleMileStoneChange = (field: keyof Milestone, value: any) => {
            setMilestoneData({ ...milestoneData, [field]: value });
    };

    const updateMilestone = ()=>{
        onChange(index, milestoneData ? milestone : null);
    }

  return (
    <div>
        <div className="milestone-field border p-2 mb-4 relative">
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Milestone Name */}
          <div>
            <CustomInput
              name="name"
              id="milestone-name"
              disable={!(change ==='all' || change === 'name')}
              value={milestone && milestone.name ? milestone.name : ''}
              label={t('FORMS.name')}
              onChange={(e) => handleMileStoneChange('name', e.target.value)}
            />
          </div>

          <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2'>
            {/* Milestone Due Date */}
            <div>
              <CustomDateTimePicker
                name="dueDate"
                label={t('FORMS.dueDate')}
                disable={!(change ==='all' || change === 'name')}
                selectedDate={milestone && milestone?.dueDate}
                onChange={(recordId, value, name) => handleMileStoneChange('dueDate', value)}
              />
            </div>

            {/* Milestone Status */}
            <div>
              <CustomDropdown
                data={milestoneStatuses}
                label={t('status')}
                selectedValue={milestone && milestone.status ? milestone.status : ''}
                onChange={(recordId, name, value, data) => handleMileStoneChange('status', value as Milestone['status'])}
              />
            </div>
          </div>
        </div>

        {/* Add/Update Milestone Button */}
        <div className="flex justify-end mt-2">
          <CustomSmallButton
            type={'update'}
            onClick={updateMilestone}
          />
        </div>
      </div>
      
    </div>
  )
}

export default MilestonesForm
