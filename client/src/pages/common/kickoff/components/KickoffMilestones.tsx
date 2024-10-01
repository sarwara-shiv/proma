import { Milestone } from '@/interfaces'
import React, { useEffect, useState } from 'react'

interface ArgsType{
    milestones:Milestone[],
    name:string,
    onChange:(name:string, value:Milestone[])=>void
}

const KickoffMilestones:React.FC<ArgsType> = ({milestones=[], name, onChange}) => {
    const [milestoneValue, setMilestonValue] = useState<Milestone[]>(milestones)
    const [count, setCount] = useState<number>(milestones.length + 1 )
    const handleMilestoneChange = (value:Milestone)=>{
        // onChange(name, value);
    }

    useEffect(()=>{
        onChange(name, milestoneValue);
    },[milestoneValue])

  return (
    <div>
      
    </div>
  )
}

export default KickoffMilestones
