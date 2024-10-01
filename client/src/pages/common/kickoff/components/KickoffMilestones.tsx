import { CustomDropdown, CustomInput } from '../../../../components/forms';
import CustomSmallButton from '../../../../components/common/CustomSmallButton';
import { Milestone } from '@/interfaces';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { IoRemove } from 'react-icons/io5';
import { milestoneStatuses } from '../../../../config/predefinedDataConfig';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';

interface ArgsType {
  milestones: Milestone[] | [];
  name: string;
  title?:string;
  onChange: (name: string, value: Milestone[]) => void;
}

const KickoffMilestones: React.FC<ArgsType> = ({ milestones = [], name, onChange, title }) => {
    const {t} = useTranslation()
  const [milestoneValue, setMilestoneValue] = useState<Milestone[]>(milestones);

  // Single milestone state for form inputs
  const [currentMilestone, setCurrentMilestone] = useState<Milestone>({
    name: '',
    dueDate: null,
    status: 'notStarted',
  });

  // Handle adding the current milestone to the array
  const handleAddMilestone = () => {
    if (currentMilestone.name.trim()) {
      setMilestoneValue([...milestoneValue, currentMilestone]);
      // Clear the input fields after adding
      setCurrentMilestone({ name: '', dueDate: null, status: 'notStarted' });
    }
  };

  // Handle change in the form fields (name, due date, status) for the current milestone
  const handleCurrentMilestoneChange = (field: keyof Milestone, value: any) => {
    console.log(field, value)
    setCurrentMilestone({ ...currentMilestone, [field]: value });
  };

  // Handle removing a milestone
  const handleRemove = (index: number) => {
    const updatedMilestones = milestoneValue.filter((_, i) => i !== index);
    setMilestoneValue(updatedMilestones);
  };

  // Propagate the milestone values back to the parent component
  useEffect(() => {
    onChange(name, milestoneValue);
  }, [milestoneValue]);

  return (
    <div>
        {title && <h3>{title}</h3>}
      {milestoneValue.map((milestone, index) => (
        <div key={index} className="milestone-field border-b p-2 mb-2 relative">
          {/* Milestone Remove Button */}
          <span
            className="cursor-pointer absolute top-0 right-0 p-0.5 bg-red-100 rounded-full text-red-500 text-sm"
            onClick={() => handleRemove(index)}
          >
            <IoRemove />
          </span>

          {/* Display Milestone Info */}
          <div 
          className='grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 rounded-md pr-[20px] bg-white'
          >

          
            <div className="flex flex-cols items-center">
                {milestone.name}

                <div className="text-gray-600 text-sm pl-2">
                    <span className='text-sm text-slate-300'>
                    {t('FORMS.dueDate')}: 
                    </span>{milestone.dueDate ? format(new Date(milestone.dueDate), 'dd.MM.yyyy') : '-'}
                </div>
            </div>
                <div className='
                    flex justify-end
                '>

                    <div className="text-gray-600">
                        {/* <span className={`text-sm text-slate-300`}>
                        {t('FORMS.status')}: 
                        </span> */}
                        <span className={`text-sm py-1 px-2 rounded-sm bg-${milestone.status} text-${milestone.status}-dark`}>
                            {t(`${milestone.status}`)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      ))}
      {/* Current Milestone Input Form */}
      <div className="
        milestone-field border p-2 mb-4 relative 
        ">
        <div
        className='grid 
        md:grid-cols-1
        lg:grid-cols-2
        gap-2'
        >
         
            {/* Milestone Name */}
            <div>
            <CustomInput name='name' id='milestone-name' 
                value={currentMilestone.name} label={`${t('FORMS.name')}`}
                onChange={(e) => handleCurrentMilestoneChange('name', e.target.value)}
            />
            </div>
        <div className='
                grid
                sm:grid-cols-1
                md:grid-cols-2
                lg:grid-cols-2
                gap-2
            '>

            {/* Milestone Due Date */}
                <div>
                <CustomDateTimePicker 
                    name= 'dueDate'
                    label={`${t('FORMS.dueDate')}`}
                    onDateChange={(args)=>console.log(args)}
                    selectedDate={currentMilestone.dueDate}
                    onChange={(recordId, value, name) => handleCurrentMilestoneChange('dueDate', value)}
                />
                </div>

                {/* Milestone Status */}
                <div>
                    <CustomDropdown data={milestoneStatuses} label={`${t('status')}`}  
                    selectedValue={currentMilestone.status}
                    onChange={(recordId, name, value, data)=>handleCurrentMilestoneChange('status', value as Milestone['status'])}
                    />
                </div>
            </div>
        </div>   
        {/* Add Milestone Button */}
        <div className="flex justify-end mt-2">
          <CustomSmallButton type="add" onClick={handleAddMilestone} />
        </div>
      </div>

      {/* List of Added Milestones */}
   
    </div>
  );
};

export default KickoffMilestones;
