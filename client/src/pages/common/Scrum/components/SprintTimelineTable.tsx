import { CustomTooltip } from "../../../../components/common";
import { ISprint, SprintStatus, SprintTimeLineData, Task } from "../../../../interfaces";
import { ReactNode, useEffect, useState } from "react";
import { generateDateRange } from "../../../../utils/dateUtils";
import { countTasksByStatus } from "../../../../utils/tasksUtils";
import { useTranslation } from "react-i18next";

const SprintTimelineTable: React.FC<{ sprints: ISprint[] }> = ({ sprints }) => {
  const {t} = useTranslation();
    const [timelineData, setTimelineData] = useState<SprintTimeLineData[]>([]);
    const [dateRange, setDateRange] = useState<Date[]>([]);
    const [tooltip, setTooltip] = useState<{
      visible: boolean;
      x: number;
      y: number;
      content: string|ReactNode;
    }>({ visible: false, x: 0, y: 0, content: "" });
  
    useEffect(() => {
        if (sprints.length) {
          const range = generateDateRange(sprints as unknown as {startDate:Date, endDate:Date}[]);
          const data = mapSprintDataToTimeline(sprints, range);
          setDateRange(range);
          setTimelineData(data);

        }
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

      const mapSprintDataToTimeline = (
        sprints: ISprint[],
        dateRange: Date[]
      ): SprintTimeLineData[] => {
        const sprintsA:any[] = sprints
          .filter((sprint) => sprint.startDate && sprint.endDate) // Filter out sprints with invalid dates
          .map((sprint) => {
            const start = new Date(sprint.startDate!).getTime(); // Non-null assertion
            const end = new Date(sprint.endDate!).getTime(); // Non-null assertion

            let tasksSummary = <></>;
            if(sprint.backlog){
              const tByStatus = countTasksByStatus(sprint.backlog as unknown as Task[]);
              if(tByStatus){
                const taskSummaryS = Object.entries(tByStatus)
                  .map(([key, value]) => <span>{t(`${key}`)}: {value}</span>);
                  if(taskSummaryS)
                  tasksSummary = <div className="text-[10px] flex flex-col">{taskSummaryS}</div>
              }
            }
      
            return {
              _cid: sprint._cid,
              name: sprint.name,
              startDate: start,
              endDate: end,
              isActive:sprint.isActive,
              duration: end - start,
              status: sprint.status,
              tooltipData:
              <div className="flex w-full text-xs flex-col">
                <b>{sprint.name}</b>
                <span>{t('tasks')}: {sprint.backlog.length}</span> <hr/>
                {tasksSummary}
              </div>
            };
          });

        if(sprintsA && sprintsA.length > 0){
            return sprintsA as unknown as SprintTimeLineData[];
        }else{
            return []
        }
      };
      

    return (
      <div style={{ overflowX: 'auto' }} className="mt-8">
        <h2 className="text-lg font-bold mb-2">{t("Sprint Timeline")}</h2>
        <table className="table-auto border-collapse w-full ">
          <thead>
            <tr className="border border-gray-300 text-slate-500">
              <th className="px-2 py-2 border border-gray-300">Sprint</th>
              {dateRange.map((date, index) => (
                <th key={index} className="px-0 py-6 text-xs border border-gray-300 relative -top-0 -rotate-45">{date.toLocaleDateString()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
          {timelineData.length === 0 ? (
                <tr className="border border-gray-300 border border-gray-300 text-slate-500"><td colSpan={dateRange.length + 1}>No data available</td></tr>
                ) : (
                timelineData.map((sprint) => (
                    <tr key={sprint._cid} className="border border-gray-300 text-slate-500">
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
                        
                        return (
                        <td
                            key={index}
                            className={`px-0 py-2 border border-gray-300`}
                            style={{ height: '30px' }}
                            onMouseEnter={(e) => {
                              if (isInRange) {
                                setTooltip({
                                  visible: true,
                                  x: e.clientX,
                                  y: e.clientY,
                                  content: (
                                    <div className="space-y-1">
                                      {sprint.tooltipData}
                                      <div>{new Date(date).toDateString()}</div>
                                    </div>
                                  ),
                                });
                              }
                            }}
                            onMouseMove={(e) => {
                              if (isInRange) {
                                setTooltip((prev) => ({
                                  ...prev,
                                  x: e.clientX,
                                  y: e.clientY,
                                }));
                              }
                            }}
                            onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, content: "" })}
                        >

                                <div className={`relative w-full h-4`} 
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
        {tooltip.visible && (
          <div
            className="fixed bg-black text-white text-xs flex flex-col justify-start items-start rounded px-2 py-1 z-50 max-w-xs"
            style={{
              top:
                tooltip.y + 60 > window.innerHeight
                  ? tooltip.y - 40
                  : tooltip.y + 10,
              left:
                tooltip.x + 200 > window.innerWidth
                  ? tooltip.x - 150
                  : tooltip.x + 10,
              pointerEvents: 'none',
              maxWidth: '200px',
              whiteSpace: 'pre-wrap',
            }}
          >
             {/* <span dangerouslySetInnerHTML={{ __html: tooltip.content}}></span> */}
             {tooltip.content}
          </div>
        )}
      </div>
    );
   
  };

  export default SprintTimelineTable
  