import { getColorClasses } from "../../mapping/ColorClasses";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip, ResponsiveContainer,Rectangle 
    ,PieChart,
    Pie,
    Cell,
} from "recharts";

interface ArgsType {
  data: Record<string, number>;
}

type TaskStatusKey = 'toDo' | 'completed' | 'onHold' | 'inProgress' | 'pendingReview' | 'blocked' | 'overdue' | 'active';

  const COLORS_CLASSES:Record<TaskStatusKey, string> = {
    toDo: "#60A5FA", // gray
    completed: "#34D399", // green 
    active: "#FBBF24",  // 
    onHold: "#A78BFA", 
    inProgress: "#F87171", 
    pendingReview: "#F472B6", 
    blocked: "#38BDF8", 
    overdue: "#FDBA74", 
  };
const TasksStatusPieChart: React.FC<ArgsType> = ({ data }) => {
  const { t } = useTranslation();

  // Build chartData only when `data` changes
  const chartData = useMemo(() => {
    const keys:TaskStatusKey[] = [
      "toDo",
      "completed",
      "onHold",
      "pendingReview",
      "inProgress",
      "blocked",
      "overdue",
      "active",
    ];

    return keys
      .filter((key) => data[key] > 0)
      .map((key) => ({
        key,
        name: t(key), 
        value: data[key],
      }));
  }, [data, t]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-white shadow-lg rounded-lg p-2 text-sm"
          style={{
            fontSize: '16px',
            WebkitBoxShadow: '0px 3px 15px rgba(0,0,0,0.2)',
            borderRadius: '8px',
          }}
        >
          <p className="text-gray-600 font-medium text-sm">{t(label)}</p>
          <p className="text-primary font-semibold">
            {payload[0].value}
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="w-full min-h-[350px] p-2 mb-2 bg-gray-100 rounded-xl">
      <div className="w-full h-[300px] pb-6">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
                data={chartData}
                dataKey={"value"}
                nameKey={"name"}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#4f46e5"
                labelLine={true}
                label
            >
            {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS_CLASSES[entry.key] || '#A5B4FC'} />
              ))}
            </Pie>
            <Tooltip
                content={<CustomTooltip />}
                cursor={false}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <span className="text-gray-500">{t("noData") || "No Data"}</span>
      )}
      </div>

      {Object.entries(chartData).length > 0 && 
        <div className="flex flex-row flex-wrap text-xs gap-2 ">
        {Object.entries(chartData).map(([key, entry]) => {
          console.log(entry);
          return (
              <div key={key} className="flex flex-row gap-2 justify-start items-center rounded-md p-1 border">
                  <div className="flex gap-2">
                  <div className={`w-4 h-4 border-2 border-white shadow`}
                        style={{backgroundColor:COLORS_CLASSES[entry.key] || '#A5B4FC'}}
                      ></div>
                      <div>{t(entry.name)}</div>
                  </div>
                  <div className="font-bold">({entry.value})</div>
              </div>
          )}
          )}
        </div>
      }

    </div>
  );
};

export default TasksStatusPieChart;
