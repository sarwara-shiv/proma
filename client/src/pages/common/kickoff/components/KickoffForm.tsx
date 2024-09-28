import React, { useState } from 'react';
import { Kickoff, NavItem } from '../../../../interfaces/types';  // Import the Kickoff interface
import { DynamicField, KickoffQuestion, KickoffResponsibility } from '../../../../interfaces/types'; // Assuming these are imported from somewhere
interface ArgsType {
  id?:string | null;
  data?:Kickoff; 
  setSubNavItems: React.Dispatch<React.SetStateAction<any>>;
  navItems:NavItem[];
  checkDataBy?:string[];
}


const KickoffForm: React.FC<ArgsType> = ({id, data, checkDataBy, setSubNavItems}) => {
  const [kickoff, setKickoff] = useState<Kickoff>({
    _cid: '',
    description: '',
    date: new Date(),
    customFields: [], // Assuming empty at the start
    questions: [],
    projectTimeline: {
      startDate: new Date(),
      endDate: new Date(),
      keyMilestones: [],
    },
    projectGoals: [],
    attendees: [],
    notes: '',
    actionItems: [],
    responsibilities: [],
  });

  // Handler for general form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setKickoff(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for date fields
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Kickoff) => {
    setKickoff(prev => ({
      ...prev,
      [field]: new Date(e.target.value),
    }));
  };

  // Handler for adding project goals (Array of strings)
  const addProjectGoal = (goal: string) => {
    setKickoff(prev => ({
      ...prev,
      projectGoals: [...prev.projectGoals, goal],
    }));
  };

  // Handler for adding attendees (Array of User objectIds as strings)
  const addAttendee = (attendee: string) => {
    setKickoff(prev => ({
      ...prev,
      attendees: [...prev.attendees, attendee],
    }));
  };

  // Handler for adding action items
  const addActionItem = (item: string, assignedTo: string, dueDate: Date) => {
    setKickoff(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, { item, assignedTo, dueDate }],
    }));
  };

  // Handler for form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Kickoff:", kickoff);

    // Post kickoff data to server
    try {
      const response = await fetch('/api/kickoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kickoff),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Kickoff added:', data);
      } else {
        console.error('Error submitting kickoff');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={kickoff.description}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Kickoff Date</label>
        <input
          type="date"
          value={kickoff.date.toISOString().substr(0, 10)}
          onChange={(e) => handleDateChange(e, 'date')}
        />
      </div>

      <div>
        <label>Project Start Date</label>
        {/* <input
          type="date"
          value={kickoff.projectTimeline.startDate.toISOString().substr(0, 10)}
          onChange={(e) => handleDateChange(e, 'projectTimeline.startDate')}
        /> */}
      </div>

      <div>
        <label>Project End Date</label>
        {/* <input
          type="date"
          value={kickoff.projectTimeline.endDate.toISOString().substr(0, 10)}
          onChange={(e) => handleDateChange(e, 'projectTimeline.endDate')}
        /> */}
      </div>

      <div>
        <label>Project Goals</label>
        <input
          type="text"
          placeholder="Add goal"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              addProjectGoal(target.value);
              target.value = '';
            }
          }}
        />
        <ul>
          {kickoff.projectGoals.map((goal, index) => (
            <li key={index}>{goal}</li>
          ))}
        </ul>
      </div>

      <div>
        <label>Attendees</label>
        <input
          type="text"
          placeholder="Add attendee (User ObjectId)"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              addAttendee(target.value);
              target.value = '';
            }
          }}
        />
        <ul>
          {kickoff.attendees.map((attendee, index) => (
            <li key={index}>{attendee}</li>
          ))}
        </ul>
      </div>

      {/* More fields can be added similarly */}

      <button type="submit">Submit Kickoff</button>
    </form>
  );
};

export default KickoffForm;
