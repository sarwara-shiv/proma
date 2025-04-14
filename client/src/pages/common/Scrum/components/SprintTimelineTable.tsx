import { CustomTooltip } from "../../../../components/common";
import { ISprint, SprintStatus, SprintTimeLineData } from "../../../../interfaces";
import { useEffect, useState } from "react";

const SprintTimelineTable: React.FC<{ sprints: ISprint[] }> = ({ sprints }) => {
    const [timelineData, setTimelineData] = useState<SprintTimeLineData[]>([]);
    const [dateRange, setDateRange] = useState<Date[]>([]);
  
    useEffect(() => {
        if (sprints.length) {
          const range = generateDateRange(sprints);
          const data = mapSprintDataToTimeline(sprints, range);
          setDateRange(range);
          setTimelineData(data);
        }
        console.log("Date Range:", dateRange); // Check the date range
        console.log("Timeline Data:", timelineData); // Check the timeline data
      }, [sprints]);
  
      const getStatusColor = (status: SprintStatus, isActive:boolean=false): string => {
        let color =  status === 'active' ? '#22c55e' :
                       status === 'completed' ? '#3b82f6' :
                       status === 'upcoming' ? '#facc15' :
                       status === 'delayed' ? '#ef4444' :
                       '#9ca3af';
        if(status === 'upcoming' && isActive){
            color = "#22c55e";
        }
        return color;
      };

      const generateDateRange = (sprints: ISprint[]): Date[] => {
        const validSprints = sprints.filter(
          (sprint) => sprint.startDate && sprint.endDate
        );
        console.log("Valid Sprints:", validSprints); // Debug filtered sprints
      
        if (validSprints.length === 0) {
          return [];
        }
      
        const minStartDate = Math.min(
          ...validSprints.map((sprint) => new Date(sprint.startDate!).getTime())
        );
        const maxEndDate = Math.max(
          ...validSprints.map((sprint) => new Date(sprint.endDate!).getTime())
        );
      
        const dates: Date[] = [];
        let currentDate = minStartDate;
      
        while (currentDate <= maxEndDate) {
          dates.push(new Date(currentDate));
          currentDate += 1000 * 60 * 60 * 24;
        }
      
        return dates;
      };
      
      const mapSprintDataToTimeline = (
        sprints: ISprint[],
        dateRange: Date[]
      ): SprintTimeLineData[] => {
        const sprintsA:any[] = sprints
          .filter((sprint) => sprint.startDate && sprint.endDate) // Filter out sprints with invalid dates
          .map((sprint) => {
            const start = new Date(sprint.startDate!).getTime(); // Non-null assertion
            const end = new Date(sprint.endDate!).getTime(); // Non-null assertion
      
            return {
              _cid: sprint._cid,
              name: sprint.name,
              startDate: start,
              endDate: end,
              isActive:sprint.isActive,
              duration: end - start,
              status: sprint.status,
            };
          });

        if(sprintsA && sprintsA.length > 0){
            return sprintsA as unknown as SprintTimeLineData[];
        }else{
            return []
        }
      };
      

    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="table-auto border-collapse w-full ">
          <thead>
            <tr className="border border-gray-300">
              <th className="px-4 py-2 border border-gray-300">Sprint Name</th>
              {dateRange.map((date, index) => (
                <th key={index} className="px-4 py-2 text-xs border border-gray-300">{date.toLocaleDateString()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
          {timelineData.length === 0 ? (
                <tr className="border border-gray-300 border border-gray-300"><td colSpan={dateRange.length + 1}>No data available</td></tr>
                ) : (
                timelineData.map((sprint) => (
                    <tr key={sprint._cid} className="border border-gray-300">
                    <td className="px-4 py-2 text-xs min-w-[150px] border border-gray-300">
                        <CustomTooltip content={sprint.name}>
                            <div className="flex flex-col justify-start">
                                <span className="font-bold">{sprint._cid}</span>
                                {sprint.name}
                            </div>
                        </CustomTooltip>
                    </td>
                    {dateRange.map((date, index) => {
                        const dateTimestamp = date.getTime();
                        const isInRange = dateTimestamp >= new Date(sprint.startDate).getTime() && dateTimestamp <= new Date(sprint.endDate).getTime();
                        console.log(new Date(sprint.startDate),' ', new Date(sprint.startDate));
                        console.log(isInRange);
                        return (
                        <td
                            key={index}
                            className={`px-0 py-2 border border-gray-300`}
                            style={{ height: '30px' }}
                        >

                                <div className={`relative w-full h-2`} 
                                style={ {backgroundColor: isInRange ? getStatusColor(sprint.status, sprint.isActive) : 'white' }}
                                >
                                    
                                    <span className="absolute inset-0 w-full h-full block"></span>
    
                                </div>
                        </td>
                        );
                    })}
                    </tr>
                ))
                )}
          </tbody>
        </table>
      </div>
    );
  };

  export default SprintTimelineTable
  