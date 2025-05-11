import { CustomDropdown, CustomInput } from '../../../../components/forms';
import CustomSmallButton from '../../../../components/common/CustomSmallButton';
import { MainTask, Milestone } from '@/interfaces';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { milestoneStatuses } from '../../../../config/predefinedDataConfig';
import CustomDateTimePicker from '../../../../components/forms/CustomDatePicker';
import RichTextArea from '../../../../components/forms/RichTextArea';

interface ArgsType {
  milestones: Milestone[] | [];
  name: string;
  title?: string;
  mainTasks?:MainTask[]
  onChange: (name: string, value: Milestone[]) => void;
}

const mileStoneEmpty:Milestone={
  name: '',
  description:'',
    dueDate: null,
    status: 'notStarted',
}

const KickoffMilestones: React.FC<ArgsType> = ({ milestones = [], name, onChange, title, mainTasks }) => {
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
      setCurrentMilestone({ name: '', dueDate: null, status: 'notStarted', description:'' });
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
  useEffect(() => {
    console.log(milestoneStatuses);
  }, []);

  return (
    <div>
      {title && <h3>{title}</h3>}

      {milestoneValue.map((milestone, index) => (
        <div key={index} className="milestone-field mb-2 relative pr-[50px] flex justify-between
          bg-white  border rounded-md mb-3
        ">
          {/* Display Milestone Info */}
          <div
            className=' gap-2 py-1 rounded-md w-full
            align-middle cursor-pointer'
            onClick={() => handleEdit(index)}
          >
            <div className="flex flex-cols items-center gap-4 w-full">
              <div className='flex justify-between gap-4 mb-2 items-center px-2'>
                <span className='text-md font-semibold text-slate-600'>{milestone.name}</span>
                <div className="text-gray-600 text-sm pl-2">
                  <span className='text-sm text-slate-300'>
                    {t('FORMS.dueDate')}:
                  </span>
                  {milestone.dueDate ? format(new Date(milestone.dueDate), 'dd.MM.yyyy') : '-'}
                </div>
                <div className='flex justify-end'>
                  <div className="text-gray-600">
                    <span className={`text-xs py-1 px-1 rounded-sm bg-${milestone.status} text-${milestone.status}-dark`}>
                      {t(`${milestone.status}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
              <div className='text-xs px-2 mb-2 text-slate-500' dangerouslySetInnerHTML={{__html: milestone.description || ''}}>
              </div>
          </div>
    
          <div className='absolute ml-4 flex flex-cols gap-2 top-4 right-1 bg-white' >
                {/* <DeleteSmallButton onClick={() => handleRemove(index)} position='relative' /> */}
                {!(editingIndex !== null && editingIndex === index) && 
                <CustomSmallButton onClick={() => handleEdit(index)} type='update' position='relative' right={1}/> 
              }
              <CustomSmallButton onClick={() => handleRemove(index)} type='remove' position='relative' right={1}/> 
              </div>
        </div>
      ))}

      {/* Current Milestone Input Form (used for both adding and editing) */}
      <div className="milestone-field border p-2 mb-4 relative rounded-md bg-slate-100">
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

          <div className='relative grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2'>
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
            <div className='relative'>
              <CustomDropdown
                data={milestoneStatuses}
                style='default'
                label={t('status')}
                selectedValue={currentMilestone.status}
                onChange={(recordId, name, value, data) => handleCurrentMilestoneChange('status', value as Milestone['status'])}
              />
            </div>
          </div>
        </div>
        <div>
          <RichTextArea 
            defaultValue={currentMilestone.description}
            name='description'
            label={t('FORMS.description')}
            onChange={(name, value) => handleCurrentMilestoneChange('description', value)}
          />
        </div>

        {/* Add/Update Milestone Button */}
        <div className="flex justify-end mt-2 gap-2">
        {editingIndex !== null && 
           <CustomSmallButton
           type={'delete'}
           text={t('remove')}
           onClick={resetMilestoneForm}
         />
          }

          <CustomSmallButton
          text={editingIndex !== null ? `${t('update')}` : `${t('add')}`}
            type={editingIndex !== null ? 'update' : 'add'}
            onClick={handleAddOrUpdateMilestone}
          />

        
        </div>
      </div>
    </div>
  );
};

export default KickoffMilestones;
