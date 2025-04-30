import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle, Cell, Text } from "recharts";

interface ArgsType {
  data: Record<string, number>;
}
type TaskStatusKey = 'toDo' | 'completed' | 'onHold' | 'pendingReview' | 'blocked' | 'overdue' | 'active';
const COLORS_CLASSES:Record<TaskStatusKey, string> = {
  toDo: "#dfdfdf", // light indigo
  completed: "#b1ffcc", // light red
  onHold: "#fef3c7", // light yellow
  pendingReview: "#fef9c3", // light greenish
  active: "#d1fae5", // light greenish
  blocked: "#dfdfdf", // light gray
  overdue: "#fee2e2", // light red
};

const TasksStatusBarChart: React.FC<ArgsType> = ({ data }) => {
  const { t } = useTranslation();

  const CustomActiveBar = (props: any) => {
    const { x, y, width, height, fill } = props;

    return (
      <>
        {/* Background highlight behind the bar */}
        <Rectangle
          x={x - 5}
          y={0}
          width={width + 10}
          height={props.background.height}
          fill="#E0E7FF" // light background on hover
          radius={[4, 4, 0, 0]}
        />
        {/* Actual bar */}
        <Rectangle x={x} y={y} width={width} height={height} fill={fill} />
      </>
    );
  };

  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <Text
        x={x}
        y={y}
        dy={10}
        textAnchor="end"
        transform={`rotate(-20, ${x}, ${y})`}
        fontSize={10}
        fill="#4B5563" // Tailwind gray-700
      >
        {payload.value}
      </Text>
    );
  };

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
      .filter((key) => data[key] > 0) // filter out keys with zero value
      .map((key) => ({
        key,
        name: t(key), // keep the original key as name
        value: data[key],
      }));
  }, [data]);

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
          <BarChart data={chartData}>
            <XAxis dataKey="name" 
            tick={<CustomXAxisTick />}
              interval={0} 
            />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="value" activeBar={<CustomActiveBar />}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS_CLASSES[entry.key] || '#A5B4FC'} // Default to black if no color found
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <span className="text-gray-500">{t("noData") || "No Data"}</span>
      )}
    </div>
  );
};

export default TasksStatusBarChart;
