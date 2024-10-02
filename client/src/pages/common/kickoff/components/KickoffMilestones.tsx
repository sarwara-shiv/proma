import { CustomDropdown, CustomInput } from '../../../../components/forms';
import CustomSmallButton from '../../../../components/common/CustomSmallButton';
import { Milestone } from '@/interfaces';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { IoRemove } from 'react-icons/io5';
import { milestoneStatuses } from '../../../../config/predefinedDataConfig';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import DeleteSmallButton from '../../../../components/common/DeleteSmallButton';

interface ArgsType {
  milestones: Milestone[] | [];
  name: string;
  title?: string;
  onChange: (name: string, value: Milestone[]) => void;
}

const mileStoneEmpty:Milestone={
  name: '',
    dueDate: null,
    status: 'notStarted',
}

const KickoffMilestones: React.FC<ArgsType> = ({ milestones = [], name, onChange, title }) => {
  const { t } = useTranslation();
  const [milestoneValue, setMilestoneValue] = useState<Milestone[]>(milestones);

  // State for tracking the milestone currently being edited
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone>(mileStoneEmpty);

  // Handle adding or updating a milestone
  const handleAddOrUpdateMilestone = () => {
    if (currentMilestone.name.trim()) {
      if (editingIndex !== null) {
        // Update the milestone if editing
        const updatedMilestones = milestoneValue.map((milestone, index) =>
          index === editingIndex ? currentMilestone : milestone
        );
        setMilestoneValue(updatedMilestones);
      } else {
        // Add a new milestone if not editing
        setMilestoneValue([...milestoneValue, currentMilestone]);
      }

      // Clear the input fields and reset the editing state
      setCurrentMilestone({ name: '', dueDate: null, status: 'notStarted' });
      setEditingIndex(null);
    }
  };

  // Handle change in the form fields (name, due date, status) for the current milestone
  const handleCurrentMilestoneChange = (field: keyof Milestone, value: any) => {
    setCurrentMilestone({ ...currentMilestone, [field]: value });
  };

  // Handle removing a milestone
  const handleRemove = (index: number) => {
    const updatedMilestones = milestoneValue.filter((_, i) => i !== index);
    setMilestoneValue(updatedMilestones);
    setEditingIndex(null); // Close editing if removing an item
  };

  const resetMilestoneForm = ()=>{
    setEditingIndex(null);
    setCurrentMilestone(mileStoneEmpty);
  }

  // Open the edit form for a specific milestone
  const handleEdit = (index: number) => {
    setCurrentMilestone(milestoneValue[index]);
    console.log(milestoneValue[index]);
    setEditingIndex(index);
  };

  // Propagate the milestone values back to the parent component
  useEffect(() => {
    onChange(name, milestoneValue);
  }, [milestoneValue]);

  return (
    <div>
      {title && <h3>{title}</h3>}

      {milestoneValue.map((milestone, index) => (
        <div key={index} className="milestone-field mb-2 relative">
          {/* Milestone Remove Button */}
        

          {/* Display Milestone Info */}
          <div
            className='grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-2 py-1 rounded-md pr-[40px] bg-white align-middle cursor-pointer'
            onClick={() => handleEdit(index)}
          >
            <div className="flex flex-cols items-center">
              <b>- </b>{milestone.name}
              <div className="text-gray-600 text-sm pl-2">
                <span className='text-sm text-slate-300'>
                  {t('FORMS.dueDate')}:
                </span>
                {milestone.dueDate ? format(new Date(milestone.dueDate), 'dd.MM.yyyy') : '-'}
              </div>
            </div>
            <div className='flex justify-end'>
              <div className="text-gray-600">
                <span className={`text-xs py-1 px-1 rounded-sm bg-${milestone.status} text-${milestone.status}-dark`}>
                  {t(`${milestone.status}`)}
                </span>
              </div>

              <div className='w-[5px] ml-4' >
                <DeleteSmallButton onClick={() => handleRemove(index)} />
                {!(editingIndex !== null && editingIndex === index) && 
                <CustomSmallButton onClick={() => handleEdit(index)} type='update' position='absolute' right={1}/> 
                }
              </div>
            </div>

            
          </div>
        </div>
      ))}

      {/* Current Milestone Input Form (used for both adding and editing) */}
      <div className="milestone-field border p-2 mb-4 relative">
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Milestone Name */}
          <div>
            <CustomInput
              name="name"
              id="milestone-name"
              value={currentMilestone.name}
              label={t('FORMS.name')}
              onChange={(e) => handleCurrentMilestoneChange('name', e.target.value)}
            />
          </div>

          <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2'>
            {/* Milestone Due Date */}
            <div>
              <CustomDateTimePicker
                name="dueDate"
                label={t('FORMS.dueDate')}
                selectedDate={currentMilestone.dueDate}
                onChange={(recordId, value, name) => handleCurrentMilestoneChange('dueDate', value)}
              />
            </div>

            {/* Milestone Status */}
            <div>
              <CustomDropdown
                data={milestoneStatuses}
                label={t('status')}
                selectedValue={currentMilestone.status}
                onChange={(recordId, name, value, data) => handleCurrentMilestoneChange('status', value as Milestone['status'])}
              />
            </div>
          </div>
        </div>

        {/* Add/Update Milestone Button */}
        <div className="flex justify-end mt-2 gap-2">
        {editingIndex !== null && 
           <CustomSmallButton
           type={'delete'}
           onClick={resetMilestoneForm}
         />
          }

          <CustomSmallButton
            type={editingIndex !== null ? 'update' : 'add'}
            onClick={handleAddOrUpdateMilestone}
          />

        
        </div>
      </div>
    </div>
  );
};

export default KickoffMilestones;
