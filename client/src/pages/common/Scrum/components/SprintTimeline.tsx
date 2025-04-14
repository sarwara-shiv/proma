import SprintTimelineChart from "../../../../components/charts/SprintTimelineChart";
import { ISprint, SprintTimeLineData } from "../../../../interfaces"
import { useEffect, useState } from "react";
import SprintTimelineTable from "./SprintTimelineTable";

interface ArgsType {
    sprints:ISprint[];
}
const SprintTimeLine:React.FC<ArgsType> = ({sprints})=>{
    const [timelineData, setTimelineData] = useState<SprintTimeLineData[]>()
    useEffect(()=>{
        if (!sprints || sprints.length === 0) return;

        const transformed: any[] = sprints.map((sprint:ISprint) => {
            if(sprint.startDate && sprint.endDate && sprint._cid){
                const start = new Date(sprint.startDate).getTime();
                const end = new Date(sprint.endDate).getTime();
    
                return {
                _cid: sprint._cid,
                name: sprint.name,
                startDate: start,
                endDate: end,
                duration: end - start,
                status: sprint.status,
                };
            }
        });

        if(transformed && transformed.length > 0){
            setTimelineData(transformed as unknown as SprintTimeLineData[]);
            console.log('*****',transformed);
        }
    },[])

    return <>
        {timelineData && timelineData.length > 0 && 
            // <SprintTimelineChart sprints={timelineData}/>
            <SprintTimelineTable sprints={sprints}/>
        } 
    </>
}

export default SprintTimeLine