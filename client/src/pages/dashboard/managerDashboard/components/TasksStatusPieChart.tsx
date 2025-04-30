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

type TaskStatusKey = 'toDo' | 'completed' | 'onHold' | 'pendingReview' | 'blocked' | 'overdue' | 'active';
const COLORS = [
    "#A5B4FC", // light indigo
    "#6EE7B7", // light green
    "#FCD34D", // soft yellow
    "#FCA5A5", // light red
    "#93C5FD", // light blue
    "#DDD6FE", // lavender
  ];
  const COLORS_CLASSES:Record<TaskStatusKey, string> = {
    toDo: "#A5B4FC", // light indigo
    completed: "#b1ffcc", // light red
    active: "#d1fae5", // light red
    onHold: "#fef3c7", // light yellow
    pendingReview: "#fef9c3", // light greenish
    blocked: "#dfdfdf", // light gray
    overdue: "#fee2e2", // light red
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
          <p className="text-indigo-600 font-semibold">
            {payload[0].value}
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="w-full h-[350px] p-2 mb-2 bg-gray-100 rounded-xl">
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
                label={({ name, cx, cy, midAngle, innerRadius, outerRadius  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius +20;  // Adjust position to stay inside the slice
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return(<text
                        x={x}
                        y={y}
                    textAnchor="middle"
                    fill="#000000" // Custom color for the label text
                    fontSize="12px"
                    fontWeight="bold"
                >
                    {name}
                </text>)}
              }
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
  );
};

export default TasksStatusPieChart;
