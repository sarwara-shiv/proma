import CustomSmallButton from '../../../../components/common/CustomSmallButton';
import { Milestone } from '@/interfaces';
import React, { useState, useEffect } from 'react';
import { IoRemove } from 'react-icons/io5';

interface ArgsType {
  milestones: Milestone[] | [];
  name: string;
  onChange: (name: string, value: Milestone[]) => void;
}

const KickoffMilestones: React.FC<ArgsType> = ({ milestones = [], name, onChange }) => {
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
      <h3>Milestones</h3>

      {/* Current Milestone Input Form */}
      <div className="milestone-field border p-2 mb-4 relative">
        {/* Milestone Name */}
        <div>
          <label htmlFor={`milestone-name`}>Milestone Name</label>
          <input
            type="text"
            id={`milestone-name`}
            value={currentMilestone.name}
            onChange={(e) => handleCurrentMilestoneChange('name', e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>

        {/* Milestone Due Date */}
        <div>
          <label htmlFor={`milestone-date`}>Due Date</label>
          <input
            type="date"
            id={`milestone-date`}
            value={currentMilestone.dueDate ? currentMilestone.dueDate.toISOString().substring(0, 10) : ''}
            onChange={(e) => handleCurrentMilestoneChange('dueDate', e.target.value ? new Date(e.target.value) : null)}
            className="border px-2 py-1 w-full"
          />
        </div>

        {/* Milestone Status */}
        <div>
          <label htmlFor={`milestone-status`}>Status</label>
          <select
            id={`milestone-status`}
            value={currentMilestone.status}
            onChange={(e) => handleCurrentMilestoneChange('status', e.target.value as Milestone['status'])}
            className="border px-2 py-1 w-full"
          >
            <option value="notStarted">Not Started</option>
            <option value="inProgress">In Progress</option>
            <option value="onHold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Add Milestone Button */}
        <div className="flex justify-end mt-2">
          <CustomSmallButton type="add" onClick={handleAddMilestone} />
        </div>
      </div>

      {/* List of Added Milestones */}
      {milestoneValue.map((milestone, index) => (
        <div key={index} className="milestone-field border p-2 mb-4 relative">
          {/* Milestone Remove Button */}
          <span
            className="cursor-pointer absolute top-0 right-0 p-0.5 bg-red-100 rounded-full text-red-500 text-sm"
            onClick={() => handleRemove(index)}
          >
            <IoRemove />
          </span>

          {/* Display Milestone Info */}
          <div className="font-semibold">{milestone.name}</div>
          <div className="text-gray-600">
            Due: {milestone.dueDate ? milestone.dueDate.toISOString().substring(0, 10) : 'No date set'}
          </div>
          <div className="text-gray-600">Status: {milestone.status}</div>
        </div>
      ))}
    </div>
  );
};

export default KickoffMilestones;
