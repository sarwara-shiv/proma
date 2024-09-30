import React, { useState } from 'react';
import { Kickoff, NavItem } from '../../../../interfaces/types';  // Import the Kickoff interface
import { DynamicField, KickoffQuestion, KickoffResponsibility } from '../../../../interfaces/types'; // Assuming these are imported from somewhere
import { setConstantValue } from 'typescript';
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
    customFields: [],
    questions: [],
    projectTimeline: {
      startDate: new Date(),
      endDate: new Date(),
      keyMilestones: [],
    },
    projectGoals: [],
    attendees: [],
    notes: [],
    actionItems: [],
    responsibilities: [],
  });

  const [editorContent, setEditorContent] = useState<string>('<p>Your initial content here</p>');

  // Handle content change
  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };



  return (
    <>
  
        </>
  );
};

export default KickoffForm;
